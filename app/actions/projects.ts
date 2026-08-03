// app/actions/projects.ts

'use server';

import { revalidatePath } from 'next/cache';

import { sql } from '@/lib/db';

import {
  getCurrentUserId,
} from '@/lib/auth/current-user';

import type {
  Project,
  ProjectActionState,
  ProjectFormData,
  ProjectStatus,
} from '@/interfaces/Project';

type ProjectRow = {
  id: string;
  owner_id: string;

  name: string;
  description: string | null;

  default_hourly_rate:
    | string
    | number
    | null;

  currency: string;
  status: ProjectStatus;

  start_date:
    | string
    | Date
    | null;

  end_date:
    | string
    | Date
    | null;

  created_at: string | Date;
  updated_at: string | Date;
};

const VALID_STATUSES: ProjectStatus[] = [
  'draft',
  'active',
  'paused',
  'completed',
  'archived',
];

function isValidUuid(
  value: string
): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function normalizeDate(
  value:
    | string
    | Date
    | null
): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value
      .toISOString()
      .slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function normalizeDateTime(
  value: string | Date
): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function mapProjectRow(
  row: ProjectRow
): Project {
  return {
    id: String(row.id),
    ownerId: String(row.owner_id),

    name: row.name,
    description: row.description,

    defaultHourlyRate:
      row.default_hourly_rate === null
        ? null
        : Number(
            row.default_hourly_rate
          ),

    currency: row.currency,
    status: row.status,

    startDate: normalizeDate(
      row.start_date
    ),

    endDate: normalizeDate(
      row.end_date
    ),

    createdAt: normalizeDateTime(
      row.created_at
    ),

    updatedAt: normalizeDateTime(
      row.updated_at
    ),
  };
}

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

function optionalText(
  value: string
): string | null {
  const normalized =
    value.trim();

  return normalized || null;
}

function parseProjectFormData(
  formData: FormData
):
  | {
      success: true;
      data: ProjectFormData;
    }
  | {
      success: false;
      result: ProjectActionState;
    } {
  const name =
    getString(formData, 'name');

  const description =
    getString(
      formData,
      'description'
    );

  const defaultHourlyRate =
    getString(
      formData,
      'defaultHourlyRate'
    );

  const currency =
    getString(
      formData,
      'currency'
    ).toUpperCase();

  const rawStatus =
    getString(
      formData,
      'status'
    ) as ProjectStatus;

  const startDate =
    getString(
      formData,
      'startDate'
    );

  const endDate =
    getString(
      formData,
      'endDate'
    );

  const status =
    VALID_STATUSES.includes(
      rawStatus
    )
      ? rawStatus
      : 'active';

  const fieldErrors: Partial<
    Record<
      keyof ProjectFormData,
      string
    >
  > = {};

  if (!name) {
    fieldErrors.name =
      'Informe o nome do projeto.';
  }

  if (
    !/^[A-Z]{3}$/.test(currency)
  ) {
    fieldErrors.currency =
      'Informe uma moeda válida com 3 letras.';
  }

  if (defaultHourlyRate) {
    const hourlyRate =
      Number(defaultHourlyRate);

    if (
      !Number.isFinite(hourlyRate) ||
      hourlyRate < 0
    ) {
      fieldErrors.defaultHourlyRate =
        'Informe um valor por hora válido.';
    }
  }

  if (
    startDate &&
    Number.isNaN(
      new Date(
        `${startDate}T00:00:00Z`
      ).getTime()
    )
  ) {
    fieldErrors.startDate =
      'Informe uma data inicial válida.';
  }

  if (
    endDate &&
    Number.isNaN(
      new Date(
        `${endDate}T00:00:00Z`
      ).getTime()
    )
  ) {
    fieldErrors.endDate =
      'Informe uma data final válida.';
  }

  if (
    startDate &&
    endDate &&
    endDate < startDate
  ) {
    fieldErrors.endDate =
      'A data final não pode ser anterior à data inicial.';
  }

  if (
    Object.keys(
      fieldErrors
    ).length > 0
  ) {
    return {
      success: false,

      result: {
        success: false,

        message:
          'Revise os campos destacados.',

        fieldErrors,
      },
    };
  }

  return {
    success: true,

    data: {
      name,
      description,
      defaultHourlyRate,
      currency,
      status,
      startDate,
      endDate,
    },
  };
}

export async function getProjects({
  includeArchived = false,
}: {
  includeArchived?: boolean;
} = {}): Promise<Project[]> {
  const ownerId =
    await getCurrentUserId();

  const rows = await sql`
    SELECT
      id,
      owner_id,

      name,
      description,

      default_hourly_rate,
      currency,
      status,

      start_date,
      end_date,

      created_at,
      updated_at

    FROM public.projects

    WHERE
      owner_id =
        ${ownerId}::uuid

      AND (
        ${includeArchived}
        OR status <> 'archived'
      )

    ORDER BY
      created_at DESC,
      name ASC
  `;

  return (
    rows as ProjectRow[]
  ).map(mapProjectRow);
}

export async function getProjectById(
  projectId: string
): Promise<Project | null> {
  if (!isValidUuid(projectId)) {
    return null;
  }

  const ownerId =
    await getCurrentUserId();

  const rows = await sql`
    SELECT
      id,
      owner_id,

      name,
      description,

      default_hourly_rate,
      currency,
      status,

      start_date,
      end_date,

      created_at,
      updated_at

    FROM public.projects

    WHERE
      id = ${projectId}::uuid
      AND owner_id =
        ${ownerId}::uuid

    LIMIT 1
  `;

  const row =
    rows[0] as
      | ProjectRow
      | undefined;

  return row
    ? mapProjectRow(row)
    : null;
}

export async function createProject(
  _previousState:
    ProjectActionState,

  formData: FormData
): Promise<ProjectActionState> {
  try {
    const parsed =
      parseProjectFormData(
        formData
      );

    if (!parsed.success) {
      return parsed.result;
    }

    const ownerId =
      await getCurrentUserId();

    const data = parsed.data;

    const hourlyRate =
      data.defaultHourlyRate
        ? Number(
            data.defaultHourlyRate
          )
        : null;

    const rows = await sql`
      INSERT INTO public.projects (
        owner_id,

        name,
        description,

        default_hourly_rate,
        currency,

        status,

        start_date,
        end_date,

        created_at,
        updated_at
      )
      VALUES (
        ${ownerId}::uuid,

        ${data.name},

        ${optionalText(
          data.description
        )},

        ${hourlyRate},
        ${data.currency},

        ${data.status},

        ${optionalText(
          data.startDate
        )}::date,

        ${optionalText(
          data.endDate
        )}::date,

        NOW(),
        NOW()
      )

      RETURNING id
    `;

    const created =
      rows[0] as
        | {
            id: string;
          }
        | undefined;

    if (!created) {
      throw new Error(
        'Projeto não retornado após a criação.'
      );
    }

    revalidatePath('/projetos');
    revalidatePath('/dashboard');

    return {
      success: true,

      message:
        'Projeto cadastrado com sucesso.',

      projectId:
        String(created.id),
    };
  } catch (error) {
    console.error(
      'Erro ao criar projeto:',
      error
    );

    const databaseError =
      error as {
        code?: string;
      };

    if (
      databaseError.code ===
      '23505'
    ) {
      return {
        success: false,

        message:
          'Já existe um projeto com esse nome na sua conta.',

        fieldErrors: {
          name:
            'Escolha outro nome para o projeto.',
        },
      };
    }

    return {
      success: false,

      message:
        'Não foi possível cadastrar o projeto.',
    };
  }
}

export async function updateProject(
  projectId: string,

  _previousState:
    ProjectActionState,

  formData: FormData
): Promise<ProjectActionState> {
  try {
    if (
      !isValidUuid(projectId)
    ) {
      return {
        success: false,

        message:
          'Identificador do projeto inválido.',
      };
    }

    const parsed =
      parseProjectFormData(
        formData
      );

    if (!parsed.success) {
      return parsed.result;
    }

    const ownerId =
      await getCurrentUserId();

    const data = parsed.data;

    const hourlyRate =
      data.defaultHourlyRate
        ? Number(
            data.defaultHourlyRate
          )
        : null;

    const rows = await sql`
      UPDATE public.projects

      SET
        name = ${data.name},

        description =
          ${optionalText(
            data.description
          )},

        default_hourly_rate =
          ${hourlyRate},

        currency =
          ${data.currency},

        status =
          ${data.status},

        start_date =
          ${optionalText(
            data.startDate
          )}::date,

        end_date =
          ${optionalText(
            data.endDate
          )}::date,

        updated_at = NOW()

      WHERE
        id = ${projectId}::uuid

        AND owner_id =
          ${ownerId}::uuid

      RETURNING id
    `;

    if (!rows[0]) {
      return {
        success: false,

        message:
          'Projeto não encontrado.',
      };
    }

    revalidatePath('/projetos');
    revalidatePath('/dashboard');

    revalidatePath(
      `/projetos/${projectId}`
    );

    revalidatePath(
      `/projetos/${projectId}/editar`
    );

    revalidatePath('/relatorios');
    revalidatePath('/faturas');

    return {
      success: true,

      message:
        'Projeto atualizado com sucesso.',

      projectId,
    };
  } catch (error) {
    console.error(
      'Erro ao atualizar projeto:',
      error
    );

    const databaseError =
      error as {
        code?: string;
      };

    if (
      databaseError.code ===
      '23505'
    ) {
      return {
        success: false,

        message:
          'Já existe um projeto com esse nome na sua conta.',

        fieldErrors: {
          name:
            'Escolha outro nome para o projeto.',
        },
      };
    }

    return {
      success: false,

      message:
        'Não foi possível atualizar o projeto.',
    };
  }
}

export async function deleteProject(
  projectId: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!isValidUuid(projectId)) {
      return {
        success: false,
        message:
          'Identificador do projeto inválido.',
      };
    }

    const ownerId =
      await getCurrentUserId();

    /*
     * Uma única instrução verifica:
     *
     * 1. se o projeto existe e pertence ao usuário;
     * 2. quantos lançamentos existem;
     * 3. quantas faturas existem;
     * 4. exclui somente quando não existem dependências.
     *
     * Isso reduz o risco de uma dependência ser criada entre
     * uma consulta de validação e a exclusão.
     */
    const rows = await sql`
      WITH target_project AS (
        SELECT id

        FROM public.projects

        WHERE
          id = ${projectId}::uuid
          AND owner_id = ${ownerId}::uuid

        LIMIT 1
      ),

      dependency_counts AS (
        SELECT
          EXISTS (
            SELECT 1
            FROM target_project
          ) AS project_exists,

          (
            SELECT COUNT(*)
            FROM public.report_entries entry
            WHERE entry.project_id = (
              SELECT id
              FROM target_project
            )
          ) AS report_entries_count,

          (
            SELECT COUNT(*)
            FROM public.invoices invoice
            WHERE invoice.project_id = (
              SELECT id
              FROM target_project
            )
          ) AS invoices_count
      ),

      deleted_project AS (
        DELETE FROM public.projects project

        WHERE
          project.id = (
            SELECT id
            FROM target_project
          )

          AND NOT EXISTS (
            SELECT 1
            FROM public.report_entries entry
            WHERE entry.project_id = project.id
          )

          AND NOT EXISTS (
            SELECT 1
            FROM public.invoices invoice
            WHERE invoice.project_id = project.id
          )

        RETURNING project.id
      )

      SELECT
        dependency.project_exists,
        dependency.report_entries_count,
        dependency.invoices_count,

        EXISTS (
          SELECT 1
          FROM deleted_project
        ) AS deleted

      FROM dependency_counts dependency
    `;

    const result = rows[0] as
      | {
          project_exists: boolean;

          report_entries_count:
            | number
            | string;

          invoices_count:
            | number
            | string;

          deleted: boolean;
        }
      | undefined;

    if (
      !result ||
      !result.project_exists
    ) {
      return {
        success: false,
        message:
          'Projeto não encontrado.',
      };
    }

    const reportEntriesCount =
      Number(
        result.report_entries_count
      );

    const invoicesCount =
      Number(
        result.invoices_count
      );

    if (!result.deleted) {
      const dependencies: string[] = [];

      if (reportEntriesCount > 0) {
        dependencies.push(
          `${reportEntriesCount} lançamento${
            reportEntriesCount === 1
              ? ''
              : 's'
          }`
        );
      }

      if (invoicesCount > 0) {
        dependencies.push(
          `${invoicesCount} fatura${
            invoicesCount === 1
              ? ''
              : 's'
          }`
        );
      }

      return {
        success: false,

        message:
          dependencies.length > 0
            ? `O projeto não pode ser excluído porque possui ${dependencies.join(
                ' e '
              )}. Remova ou transfira esses registros antes de continuar.`
            : 'Não foi possível excluir o projeto.',
      };
    }

    revalidatePath('/dashboard');
    revalidatePath('/projetos');
    revalidatePath('/relatorios');
    revalidatePath('/faturas');

    return {
      success: true,
      message:
        'Projeto excluído com sucesso.',
    };
  } catch (error) {
    console.error(
      'Erro ao excluir projeto:',
      error
    );

    const databaseError =
      error as {
        code?: string;
      };

    /*
     * Foreign key violation.
     * Funciona como uma proteção adicional caso outra tabela
     * passe a apontar para projects no futuro.
     */
    if (
      databaseError.code === '23503'
    ) {
      return {
        success: false,
        message:
          'O projeto possui registros relacionados e não pode ser excluído.',
      };
    }

    return {
      success: false,
      message:
        'Não foi possível excluir o projeto.',
    };
  }
}