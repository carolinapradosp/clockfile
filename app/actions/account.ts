// app/actions/account.ts

'use server';

import {
  revalidatePath,
} from 'next/cache';

import { redirect } from 'next/navigation';

import { sql } from '@/lib/db';

import {
  getCurrentUser,
  requireCurrentUser,
} from '@/lib/auth/current-user';

import {
  getValidSession,
  deleteCurrentSession,
} from '@/lib/auth/session';

import {
  hashPassword,
  validatePassword,
  verifyPassword,
} from '@/lib/auth/password';

import type {
  AccountActionResult,
  AccountProfileActionState,
  AccountProfileFormData,
  ChangePasswordActionState,
  ChangePasswordFormData,
  DeleteAccountActionState,
} from '@/interfaces/Account';

type UserPasswordRow = {
  id: string;
  password_hash: string | null;
};

function getString(
  formData: FormData,
  field: string
): string {
  const value =
    formData.get(field);

  return typeof value === 'string'
    ? value.trim()
    : '';
}

function normalizeEmail(
  value: string
): string {
  return value
    .trim()
    .toLowerCase();
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
  const digits =
    value.replace(/\D/g, '');

  return (
    digits.length >= 8 &&
    digits.length <= 15
  );
}

async function getCurrentPasswordHash(
  userId: string
): Promise<string | null> {
  const rows = await sql`
    SELECT
      id,
      password_hash

    FROM public.app_users

    WHERE
      id = ${userId}::uuid
      AND status = 'active'

    LIMIT 1
  `;

  const user =
    rows[0] as
      | UserPasswordRow
      | undefined;

  return user?.password_hash ?? null;
}

export async function updateAccountProfile(
  _previousState:
    AccountProfileActionState,

  formData: FormData
): Promise<AccountProfileActionState> {
  try {
    const user =
      await requireCurrentUser();

    const name =
      getString(
        formData,
        'name'
      );

    const email =
      normalizeEmail(
        getString(
          formData,
          'email'
        )
      );

    const phone =
      getString(
        formData,
        'phone'
      );

    const fieldErrors: Partial<
      Record<
        keyof AccountProfileFormData,
        string
      >
    > = {};

    if (name.length < 2) {
      fieldErrors.name =
        'Informe um nome válido.';
    }

    if (!email) {
      fieldErrors.email =
        'Informe o seu e-mail.';
    } else if (
      !isValidEmail(email)
    ) {
      fieldErrors.email =
        'Informe um e-mail válido.';
    }

    if (!phone) {
      fieldErrors.phone =
        'Informe o seu telefone.';
    } else if (
      !isValidPhone(phone)
    ) {
      fieldErrors.phone =
        'Informe um telefone válido.';
    }

    if (
      Object.keys(
        fieldErrors
      ).length > 0
    ) {
      return {
        success: false,

        message:
          'Revise os campos destacados.',

        fieldErrors,
      };
    }

    const rows = await sql`
      UPDATE public.app_users

      SET
        name = ${name},
        email = ${email},
        phone = ${phone},
        updated_at = NOW()

      WHERE
        id = ${user.id}::uuid
        AND status = 'active'

      RETURNING id
    `;

    if (!rows[0]) {
      return {
        success: false,
        message:
          'A conta não foi encontrada.',
      };
    }

    revalidatePath(
      '/dashboard'
    );

    revalidatePath(
      '/configuracoes'
    );

    return {
      success: true,
      message:
        'Dados atualizados com sucesso.',
    };
  } catch (error) {
    console.error(
      'Erro ao atualizar conta:',
      error
    );

    const databaseError =
      error as {
        code?: string;
        constraint?: string;
      };

    if (
      databaseError.code ===
      '23505'
    ) {
      return {
        success: false,

        message:
          'Este e-mail já está sendo utilizado.',

        fieldErrors: {
          email:
            'Escolha outro e-mail.',
        },
      };
    }

    return {
      success: false,
      message:
        'Não foi possível atualizar os dados da conta.',
    };
  }
}

export async function changeAccountPassword(
  _previousState:
    ChangePasswordActionState,

  formData: FormData
): Promise<ChangePasswordActionState> {
  try {
    const user =
      await requireCurrentUser();

    const session =
      await getValidSession();

    if (!session) {
      return {
        success: false,
        message:
          'Sua sessão expirou. Entre novamente.',
      };
    }

    const currentPassword =
      getString(
        formData,
        'currentPassword'
      );

    const newPassword =
      getString(
        formData,
        'newPassword'
      );

    const passwordConfirmation =
      getString(
        formData,
        'passwordConfirmation'
      );

    const fieldErrors: Partial<
      Record<
        keyof ChangePasswordFormData,
        string
      >
    > = {};

    if (!currentPassword) {
      fieldErrors.currentPassword =
        'Informe a senha atual.';
    }

    const passwordValidation =
      validatePassword(
        newPassword
      );

    if (
      !passwordValidation.valid
    ) {
      fieldErrors.newPassword =
        passwordValidation.message;
    }

    if (
      newPassword !==
      passwordConfirmation
    ) {
      fieldErrors.passwordConfirmation =
        'As novas senhas não coincidem.';
    }

    if (
      currentPassword &&
      newPassword &&
      currentPassword ===
        newPassword
    ) {
      fieldErrors.newPassword =
        'A nova senha deve ser diferente da senha atual.';
    }

    if (
      Object.keys(
        fieldErrors
      ).length > 0
    ) {
      return {
        success: false,

        message:
          'Revise os campos destacados.',

        fieldErrors,
      };
    }

    const passwordHash =
      await getCurrentPasswordHash(
        user.id
      );

    if (!passwordHash) {
      return {
        success: false,
        message:
          'Não foi possível validar a senha atual.',
      };
    }

    const currentPasswordMatches =
      await verifyPassword({
        password:
          currentPassword,

        passwordHash,
      });

    if (
      !currentPasswordMatches
    ) {
      return {
        success: false,

        message:
          'A senha atual está incorreta.',

        fieldErrors: {
          currentPassword:
            'Senha atual incorreta.',
        },
      };
    }

    const newPasswordHash =
      await hashPassword(
        newPassword
      );

    const rows = await sql`
      WITH updated_user AS (
        UPDATE public.app_users

        SET
          password_hash =
            ${newPasswordHash},

          updated_at = NOW()

        WHERE
          id = ${user.id}::uuid
          AND status = 'active'

        RETURNING id
      ),

      revoked_sessions AS (
        UPDATE public.auth_sessions

        SET
          revoked_at =
            COALESCE(
              revoked_at,
              NOW()
            )

        WHERE
          user_id =
            ${user.id}::uuid

          AND id <>
            ${session.id}::uuid

          AND revoked_at IS NULL

        RETURNING id
      )

      SELECT id
      FROM updated_user
    `;

    if (!rows[0]) {
      return {
        success: false,
        message:
          'A conta não foi encontrada.',
      };
    }

    revalidatePath(
      '/configuracoes'
    );

    return {
      success: true,

      message:
        'Senha alterada com sucesso. As outras sessões foram encerradas.',
    };
  } catch (error) {
    console.error(
      'Erro ao alterar senha:',
      error
    );

    return {
      success: false,
      message:
        'Não foi possível alterar a senha.',
    };
  }
}

export async function revokeOtherSessions(): Promise<AccountActionResult> {
  try {
    const user =
      await requireCurrentUser();

    const currentSession =
      await getValidSession();

    if (!currentSession) {
      return {
        success: false,
        message:
          'Sua sessão não foi encontrada.',
      };
    }

    const rows = await sql`
      UPDATE public.auth_sessions

      SET
        revoked_at =
          COALESCE(
            revoked_at,
            NOW()
          )

      WHERE
        user_id =
          ${user.id}::uuid

        AND id <>
          ${currentSession.id}::uuid

        AND revoked_at IS NULL

      RETURNING id
    `;

    const sessionsCount =
      rows.length;

    return {
      success: true,

      message:
        sessionsCount === 0
          ? 'Não existem outras sessões ativas.'
          : `${sessionsCount} outra${
              sessionsCount === 1
                ? ' sessão foi encerrada'
                : 's sessões foram encerradas'
            }.`,
    };
  } catch (error) {
    console.error(
      'Erro ao encerrar outras sessões:',
      error
    );

    return {
      success: false,
      message:
        'Não foi possível encerrar as outras sessões.',
    };
  }
}

export async function deleteAccount(
  _previousState:
    DeleteAccountActionState,

  formData: FormData
): Promise<DeleteAccountActionState> {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  const password =
    getString(
      formData,
      'password'
    );

  const confirmation =
    getString(
      formData,
      'confirmation'
    );

  const fieldErrors: {
    password?: string;
    confirmation?: string;
  } = {};

  if (!password) {
    fieldErrors.password =
      'Informe a sua senha.';
  }

  if (
    confirmation !==
    'EXCLUIR MINHA CONTA'
  ) {
    fieldErrors.confirmation =
      'Digite exatamente: EXCLUIR MINHA CONTA';
  }

  if (
    Object.keys(
      fieldErrors
    ).length > 0
  ) {
    return {
      success: false,

      message:
        'Confirme a exclusão da conta.',

      fieldErrors,
    };
  }

  try {
    const passwordHash =
      await getCurrentPasswordHash(
        user.id
      );

    if (!passwordHash) {
      return {
        success: false,
        message:
          'Não foi possível validar sua senha.',
      };
    }

    const passwordMatches =
      await verifyPassword({
        password,
        passwordHash,
      });

    if (!passwordMatches) {
      return {
        success: false,

        message:
          'A senha informada está incorreta.',

        fieldErrors: {
          password:
            'Senha incorreta.',
        },
      };
    }

    /*
     * Exclusão completa em uma única instrução:
     *
     * - relações entre faturas e lançamentos;
     * - itens de faturas;
     * - faturas;
     * - lançamentos;
     * - projetos;
     * - sessões;
     * - usuário.
     */
    const rows = await sql`
      WITH owned_projects AS MATERIALIZED (
        SELECT id

        FROM public.projects

        WHERE
          owner_id =
            ${user.id}::uuid
      ),

      owned_invoices AS MATERIALIZED (
        SELECT id

        FROM public.invoices

        WHERE
          owner_id =
            ${user.id}::uuid
      ),

      deleted_invoice_relations AS (
        DELETE FROM
          public.invoice_report_entries
          AS relation

        WHERE
          relation.invoice_id IN (
            SELECT id
            FROM owned_invoices
          )

          OR relation.report_entry_id IN (
            SELECT entry.id

            FROM public.report_entries
              AS entry

            WHERE
              entry.project_id IN (
                SELECT id
                FROM owned_projects
              )
          )

        RETURNING relation.id
      ),

      deleted_invoice_items AS (
        DELETE FROM
          public.invoice_items
          AS item

        WHERE
          item.invoice_id IN (
            SELECT id
            FROM owned_invoices
          )

          AND (
            SELECT COUNT(*)
            FROM deleted_invoice_relations
          ) >= 0

        RETURNING item.id
      ),

      deleted_invoices AS (
        DELETE FROM
          public.invoices
          AS invoice

        WHERE
          invoice.owner_id =
            ${user.id}::uuid

          AND (
            SELECT COUNT(*)
            FROM deleted_invoice_items
          ) >= 0

        RETURNING invoice.id
      ),

      deleted_report_entries AS (
        DELETE FROM
          public.report_entries
          AS entry

        WHERE
          entry.project_id IN (
            SELECT id
            FROM owned_projects
          )

          AND (
            SELECT COUNT(*)
            FROM deleted_invoice_relations
          ) >= 0

        RETURNING entry.id
      ),

      deleted_projects AS (
        DELETE FROM
          public.projects
          AS project

        WHERE
          project.owner_id =
            ${user.id}::uuid

          AND (
            SELECT COUNT(*)
            FROM deleted_report_entries
          ) >= 0

          AND (
            SELECT COUNT(*)
            FROM deleted_invoices
          ) >= 0

        RETURNING project.id
      ),

      deleted_sessions AS (
        DELETE FROM
          public.auth_sessions
          AS session

        WHERE
          session.user_id =
            ${user.id}::uuid

        RETURNING session.id
      ),

      deleted_user AS (
        DELETE FROM
          public.app_users
          AS user_account

        WHERE
          user_account.id =
            ${user.id}::uuid

          AND (
            SELECT COUNT(*)
            FROM deleted_projects
          ) >= 0

          AND (
            SELECT COUNT(*)
            FROM deleted_sessions
          ) >= 0

        RETURNING user_account.id
      )

      SELECT id
      FROM deleted_user
    `;

    if (!rows[0]) {
      return {
        success: false,
        message:
          'Não foi possível excluir a conta.',
      };
    }

    /*
     * A sessão já foi removida do banco, mas essa
     * chamada também elimina o cookie do navegador.
     */
    await deleteCurrentSession();
  } catch (error) {
    console.error(
      'Erro ao excluir conta:',
      error
    );

    return {
      success: false,
      message:
        'Não foi possível excluir a conta.',
    };
  }

  redirect('/');
}