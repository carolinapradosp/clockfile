// lib/auth/password.ts

import 'server-only';

import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  type ScryptOptions,
} from 'node:crypto';

const ALGORITHM = 'scrypt';

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

const SCRYPT_COST = 16384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;

/*
 * Deve ser maior que aproximadamente:
 * 128 * cost * blockSize.
 *
 * Para os parâmetros atuais:
 * 128 * 16384 * 8 = 16 MiB.
 */
const SCRYPT_MAX_MEMORY =
  32 * 1024 * 1024;

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 12;

const DEFAULT_SCRYPT_OPTIONS: ScryptOptions = {
  cost: SCRYPT_COST,
  blockSize: SCRYPT_BLOCK_SIZE,
  parallelization:
    SCRYPT_PARALLELIZATION,
  maxmem: SCRYPT_MAX_MEMORY,
};

export type PasswordValidationResult =
  | {
      valid: true;
    }
  | {
      valid: false;
      message: string;
    };

function deriveKey({
  password,
  salt,
  keyLength,
  options,
}: {
  password: string;
  salt: Buffer;
  keyLength: number;
  options: ScryptOptions;
}): Promise<Buffer> {
  return new Promise(
    (resolve, reject) => {
      scryptCallback(
        password,
        salt,
        keyLength,
        options,
        (
          error,
          derivedKey
        ) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(
            Buffer.from(derivedKey)
          );
        }
      );
    }
  );
}

export function validatePassword(
  password: string
): PasswordValidationResult {
  if (
    password.length <
    MIN_PASSWORD_LENGTH
  ) {
    return {
      valid: false,
      message:
        `A senha deve possuir pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }

  if (
    password.length >
    MAX_PASSWORD_LENGTH
  ) {
    return {
      valid: false,
      message:
        `A senha deve possuir no máximo ${MAX_PASSWORD_LENGTH} caracteres.`,
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message:
        'A senha deve possuir pelo menos uma letra maiúscula.',
    };
  }

  if (!/\d/.test(password)) {
    return {
      valid: false,
      message:
        'A senha deve possuir pelo menos um número.',
    };
  }

  return {
    valid: true,
  };
}

export async function hashPassword(
  password: string
): Promise<string> {
  const validation =
    validatePassword(password);

  if (!validation.valid) {
    throw new Error(
      validation.message
    );
  }

  const salt =
    randomBytes(SALT_LENGTH);

  const derivedKey =
    await deriveKey({
      password,
      salt,
      keyLength: KEY_LENGTH,
      options:
        DEFAULT_SCRYPT_OPTIONS,
    });

  return [
    ALGORITHM,
    String(SCRYPT_COST),
    String(SCRYPT_BLOCK_SIZE),
    String(
      SCRYPT_PARALLELIZATION
    ),
    salt.toString('base64url'),
    derivedKey.toString(
      'base64url'
    ),
  ].join('$');
}

export async function verifyPassword({
  password,
  passwordHash,
}: {
  password: string;
  passwordHash: string;
}): Promise<boolean> {
  try {
    const [
      algorithm,
      rawCost,
      rawBlockSize,
      rawParallelization,
      saltValue,
      hashValue,
    ] = passwordHash.split('$');

    if (
      algorithm !== ALGORITHM ||
      !rawCost ||
      !rawBlockSize ||
      !rawParallelization ||
      !saltValue ||
      !hashValue
    ) {
      return false;
    }

    const cost =
      Number(rawCost);

    const blockSize =
      Number(rawBlockSize);

    const parallelization =
      Number(
        rawParallelization
      );

    if (
      !Number.isSafeInteger(
        cost
      ) ||
      !Number.isSafeInteger(
        blockSize
      ) ||
      !Number.isSafeInteger(
        parallelization
      ) ||
      cost <= 1 ||
      blockSize <= 0 ||
      parallelization <= 0
    ) {
      return false;
    }

    const salt = Buffer.from(
      saltValue,
      'base64url'
    );

    const storedKey =
      Buffer.from(
        hashValue,
        'base64url'
      );

    if (
      salt.length === 0 ||
      storedKey.length !==
        KEY_LENGTH
    ) {
      return false;
    }

    const calculatedKey =
      await deriveKey({
        password,
        salt,

        keyLength:
          storedKey.length,

        options: {
          cost,
          blockSize,
          parallelization,
          maxmem:
            SCRYPT_MAX_MEMORY,
        },
      });

    if (
      calculatedKey.length !==
      storedKey.length
    ) {
      return false;
    }

    return timingSafeEqual(
      calculatedKey,
      storedKey
    );
  } catch (error) {
    console.error(
      'Erro ao verificar senha:',
      error
    );

    return false;
  }
}