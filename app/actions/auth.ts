// app/actions/auth.ts

'use server';

import { redirect } from 'next/navigation';

import { sql } from '@/lib/db';

import {
  hashPassword,
  validatePassword,
  verifyPassword,
} from '@/lib/auth/password';

import {
  createSession,
  deleteCurrentSession,
  getRequestSessionMetadata,
} from '@/lib/auth/session';

export type LoginActionState =
  | {
      success: false;
      message: string;
      fieldErrors?: {
        email?: string;
        password?: string;
      };
    }
  | null;

export type RegisterActionState =
  | {
      success: false;
      message: string;
      fieldErrors?: {
        name?: string;
        email?: string;
        phone?: string;
        password?: string;
        passwordConfirmation?: string;
      };
    }
  | null;

type UserCredentialRow = {
  id: string;
  email: string;
  password_hash: string | null;
  status: 'active' | 'blocked';
};

type CreatedUserRow = {
  id: string;
};

function getString(
  formData: FormData,
  field: string
): string {
  const value = formData.get(field);

  return typeof value === 'string'
    ? value.trim()
    : '';
}

function normalizeEmail(
  value: string
): string {
  return value.trim().toLowerCase();
}

function isValidEmail(
  value: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

function isValidPhone(
  value: string
): boolean {
  const digits = value.replace(/\D/g, '');

  return (
    digits.length >= 8 &&
    digits.length <= 15
  );
}

export async function loginUser(
  _previousState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const email = normalizeEmail(
    getString(formData, 'email')
  );

  const password =
    getString(formData, 'password');

  const fieldErrors: NonNullable<
    LoginActionState
  >['fieldErrors'] = {};

  if (!email) {
    fieldErrors.email =
      'Informe o seu e-mail.';
  } else if (!isValidEmail(email)) {
    fieldErrors.email =
      'Informe um e-mail válido.';
  }

  if (!password) {
    fieldErrors.password =
      'Informe a sua senha.';
  }

  if (
    Object.keys(fieldErrors).length > 0
  ) {
    return {
      success: false,
      message:
        'Revise os campos informados.',
      fieldErrors,
    };
  }

  let authenticatedUserId: string | null =
    null;

  try {
    const rows = await sql`
      SELECT
        id,
        email,
        password_hash,
        status

      FROM public.app_users

      WHERE LOWER(email) = ${email}

      LIMIT 1
    `;

    const user = rows[0] as
      | UserCredentialRow
      | undefined;

    /*
     * A mensagem é deliberadamente genérica para
     * não revelar se determinado e-mail existe.
     */
    if (
      !user ||
      !user.password_hash
    ) {
      return {
        success: false,
        message:
          'E-mail ou senha inválidos.',
      };
    }

    if (user.status !== 'active') {
      return {
        success: false,
        message:
          'Esta conta não está disponível para acesso.',
      };
    }

    const passwordMatches =
      await verifyPassword({
        password,
        passwordHash:
          user.password_hash,
      });

    if (!passwordMatches) {
      return {
        success: false,
        message:
          'E-mail ou senha inválidos.',
      };
    }

    const metadata =
      await getRequestSessionMetadata();

    await createSession({
      userId: String(user.id),
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
    });

    await sql`
      UPDATE public.app_users
      SET
        last_login_at = NOW(),
        updated_at = NOW()

      WHERE id = ${user.id}::uuid
    `;

    authenticatedUserId =
      String(user.id);
  } catch (error) {
    console.error(
      'Erro ao realizar login:',
      error
    );

    return {
      success: false,
      message:
        'Não foi possível realizar o login. Tente novamente.',
    };
  }

  if (authenticatedUserId) {
    redirect('/dashboard');
  }

  return {
    success: false,
    message:
      'Não foi possível realizar o login.',
  };
}

export async function registerUser(
  _previousState: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  const name =
    getString(formData, 'name');

  const email = normalizeEmail(
    getString(formData, 'email')
  );

  const phone =
    getString(formData, 'phone');

  const password =
    getString(formData, 'password');

  const passwordConfirmation =
    getString(
      formData,
      'passwordConfirmation'
    );

  const fieldErrors: NonNullable<
    RegisterActionState
  >['fieldErrors'] = {};

  if (name.length < 2) {
    fieldErrors.name =
      'Informe o seu nome completo.';
  }

  if (!email) {
    fieldErrors.email =
      'Informe o seu e-mail.';
  } else if (!isValidEmail(email)) {
    fieldErrors.email =
      'Informe um e-mail válido.';
  }

  if (!phone) {
    fieldErrors.phone =
      'Informe o seu telefone.';
  } else if (!isValidPhone(phone)) {
    fieldErrors.phone =
      'Informe um telefone válido.';
  }

  const passwordValidation =
    validatePassword(password);

  if (!passwordValidation.valid) {
    fieldErrors.password =
      passwordValidation.message;
  }

  if (
    password !== passwordConfirmation
  ) {
    fieldErrors.passwordConfirmation =
      'As senhas não coincidem.';
  }

  if (
    Object.keys(fieldErrors).length > 0
  ) {
    return {
      success: false,
      message:
        'Revise os campos informados.',
      fieldErrors,
    };
  }

  let registeredUserId: string | null =
    null;

  try {
    const passwordHash =
      await hashPassword(password);

    const existingRows = await sql`
      SELECT
        id,
        email,
        password_hash,
        status

      FROM public.app_users

      WHERE LOWER(email) = ${email}

      LIMIT 1
    `;

    const existingUser =
      existingRows[0] as
        | UserCredentialRow
        | undefined;

    if (
      existingUser?.password_hash
    ) {
      return {
        success: false,
        message:
          'Este e-mail já está cadastrado.',
        fieldErrors: {
          email:
            'Use outro e-mail ou faça login.',
        },
      };
    }

    if (
      existingUser &&
      existingUser.status === 'blocked'
    ) {
      return {
        success: false,
        message:
          'Esta conta não pode ser ativada.',
      };
    }

    if (existingUser) {
      /*
       * Ativa a conta legada criada anteriormente
       * por APP_USER_NAME e APP_USER_EMAIL.
       *
       * Faça essa ativação antes de tornar o cadastro
       * público, pois a conta ainda não possui uma
       * prova adicional de propriedade do e-mail.
       */
      const activatedRows = await sql`
        UPDATE public.app_users
        SET
          name = ${name},
          phone = ${phone},
          password_hash =
            ${passwordHash},
          status = 'active',
          last_login_at = NOW(),
          updated_at = NOW()

        WHERE
          id =
            ${existingUser.id}::uuid
          AND password_hash IS NULL

        RETURNING id
      `;

      const activatedUser =
        activatedRows[0] as
          | CreatedUserRow
          | undefined;

      if (!activatedUser) {
        return {
          success: false,
          message:
            'Este e-mail já está cadastrado.',
        };
      }

      registeredUserId =
        String(activatedUser.id);
    } else {
      const createdRows = await sql`
        INSERT INTO public.app_users (
          name,
          email,
          phone,
          password_hash,
          status,
          last_login_at,
          created_at,
          updated_at
        )
        VALUES (
          ${name},
          ${email},
          ${phone},
          ${passwordHash},
          'active',
          NOW(),
          NOW(),
          NOW()
        )
        RETURNING id
      `;

      const createdUser =
        createdRows[0] as
          | CreatedUserRow
          | undefined;

      if (!createdUser) {
        throw new Error(
          'Usuário não retornado após o cadastro.'
        );
      }

      registeredUserId =
        String(createdUser.id);
    }

    const metadata =
      await getRequestSessionMetadata();

    await createSession({
      userId: registeredUserId,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
    });
  } catch (error) {
    console.error(
      'Erro ao cadastrar usuário:',
      error
    );

    const databaseError = error as {
      code?: string;
      constraint?: string;
    };

    if (databaseError.code === '23505') {
      return {
        success: false,
        message:
          'Este e-mail já está cadastrado.',
        fieldErrors: {
          email:
            'Use outro e-mail ou faça login.',
        },
      };
    }

    return {
      success: false,
      message:
        'Não foi possível criar a conta. Tente novamente.',
    };
  }

  if (registeredUserId) {
    redirect('/dashboard');
  }

  return {
    success: false,
    message:
      'Não foi possível criar a conta.',
  };
}

export async function handleLogout(): Promise<void> {
  try {
    await deleteCurrentSession();
  } catch (error) {
    console.error(
      'Erro ao encerrar sessão:',
      error
    );
  }

  redirect('/');
}