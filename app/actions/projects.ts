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
import { isValidCurrency } from '@/lib/utils';

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

    billing_name: string | null;
billing_company: string | null;
billing_email: string | null;
billing_phone: string | null;

billing_address_line_1:
    | string
    | null;

billing_address_line_2:
    | string
    | null;

billing_city: string | null;
billing_state: string | null;

billing_postal_code:
    | string
    | null;

billing_country_code:
    | string
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

    billing: {
    name:
        row.billing_name,

    company:
        row.billing_company,

    email:
        row.billing_email,

    phone:
        row.billing_phone,

    addressLine1:
        row.billing_address_line_1,

    addressLine2:
        row.billing_address_line_2,

    city:
        row.billing_city,

    state:
        row.billing_state,

    postalCode:
        row.billing_postal_code,

    countryCode:
        row.billing_country_code,
},

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

    const billingName =
    getString(
        formData,
        'billingName'
    );

const billingCompany =
    getString(
        formData,
        'billingCompany'
    );

const billingEmail =
    getString(
        formData,
        'billingEmail'
    ).toLowerCase();

const billingPhone =
    getString(
        formData,
        'billingPhone'
    );

const billingAddressLine1 =
    getString(
        formData,
        'billingAddressLine1'
    );

const billingAddressLine2 =
    getString(
        formData,
        'billingAddressLine2'
    );

const billingCity =
    getString(
        formData,
        'billingCity'
    );

const billingState =
    getString(
        formData,
        'billingState'
    );

const billingPostalCode =
    getString(
        formData,
        'billingPostalCode'
    );

const billingCountryCode =
    getString(
        formData,
        'billingCountryCode'
    ).toUpperCase();

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
  !isValidCurrency(currency)
) {
  fieldErrors.currency =
    'Selecione uma moeda válida: BRL, USD ou EUR.';
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
    billingEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        billingEmail
    )
) {
    fieldErrors.billingEmail =
        'Informe um e-mail válido.';
}

if (
    billingCountryCode &&
    !/^[A-Z]{2}$/.test(
        billingCountryCode
    )
) {
    fieldErrors.billingCountryCode =
        'Informe o país usando duas letras, por exemplo BR ou US.';
}

if (billingPhone) {
    const phoneDigits =
        billingPhone.replace(
            /\D/g,
            ''
        );

    if (
        phoneDigits.length < 8 ||
        phoneDigits.length > 15
    ) {
        fieldErrors.billingPhone =
            'Informe um telefone válido.';
    }
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
      billingName,
billingCompany,
billingEmail,
billingPhone,

billingAddressLine1,
billingAddressLine2,

billingCity,
billingState,
billingPostalCode,
billingCountryCode,
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
      billing_name,
billing_company,
billing_email,
billing_phone,

billing_address_line_1,
billing_address_line_2,
billing_city,
billing_state,
billing_postal_code,
billing_country_code,

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
billing_name,
billing_company,
billing_email,
billing_phone,

billing_address_line_1,
billing_address_line_2,
billing_city,
billing_state,
billing_postal_code,
billing_country_code,
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
billing_name,
billing_company,
billing_email,
billing_phone,

billing_address_line_1,
billing_address_line_2,
billing_city,
billing_state,
billing_postal_code,
billing_country_code,
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
        ${optionalText(
    data.billingName
)},

${optionalText(
    data.billingCompany
)},

${optionalText(
    data.billingEmail
)},

${optionalText(
    data.billingPhone
)},

${optionalText(
    data.billingAddressLine1
)},

${optionalText(
    data.billingAddressLine2
)},

${optionalText(
    data.billingCity
)},

${optionalText(
    data.billingState
)},

${optionalText(
    data.billingPostalCode
)},

${optionalText(
    data.billingCountryCode
)},

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

          billing_name =
    ${optionalText(
        data.billingName
    )},

billing_company =
    ${optionalText(
        data.billingCompany
    )},

billing_email =
    ${optionalText(
        data.billingEmail
    )},

billing_phone =
    ${optionalText(
        data.billingPhone
    )},

billing_address_line_1 =
    ${optionalText(
        data.billingAddressLine1
    )},

billing_address_line_2 =
    ${optionalText(
        data.billingAddressLine2
    )},

billing_city =
    ${optionalText(
        data.billingCity
    )},

billing_state =
    ${optionalText(
        data.billingState
    )},

billing_postal_code =
    ${optionalText(
        data.billingPostalCode
    )},

billing_country_code =
    ${optionalText(
        data.billingCountryCode
    )},

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
     * Regra:
     *
     * - Se houver lançamentos, não exclui nada.
     * - Se não houver lançamentos, exclui:
     *   1. vínculos dos itens das faturas;
     *   2. itens das faturas;
     *   3. faturas;
     *   4. projeto.
     *
     * Tudo acontece em uma única instrução SQL.
     */
    const rows = await sql`
      WITH target_project AS MATERIALIZED (
        SELECT
          project.id

        FROM public.projects project

        WHERE
          project.id =
            ${projectId}::uuid

          AND project.owner_id =
            ${ownerId}::uuid

        LIMIT 1
      ),

      dependency_counts AS MATERIALIZED (
        SELECT
          EXISTS (
            SELECT 1
            FROM target_project
          ) AS project_exists,

          (
            SELECT COUNT(*)

            FROM public.report_entries entry

            WHERE
              entry.project_id = (
                SELECT id
                FROM target_project
              )
          ) AS report_entries_count,

          (
            SELECT COUNT(*)

            FROM public.invoices invoice

            WHERE
              invoice.project_id = (
                SELECT id
                FROM target_project
              )

              AND invoice.owner_id =
                ${ownerId}::uuid
          ) AS invoices_count
      ),

      target_invoices AS MATERIALIZED (
        SELECT
          invoice.id

        FROM public.invoices invoice

        WHERE
          invoice.project_id = (
            SELECT id
            FROM target_project
          )

          AND invoice.owner_id =
            ${ownerId}::uuid

          AND (
            SELECT
              report_entries_count

            FROM dependency_counts
          ) = 0
      ),

      deleted_invoice_relations AS (
        DELETE FROM
          public.invoice_report_entries
          AS relation

        USING target_invoices
          AS target_invoice

        WHERE
          relation.invoice_id =
            target_invoice.id

        RETURNING relation.id
      ),

      deleted_invoice_items AS (
        DELETE FROM
          public.invoice_items
          AS item

        USING target_invoices
          AS target_invoice

        WHERE
          item.invoice_id =
            target_invoice.id

          /*
           * Força a execução do CTE anterior
           * antes da exclusão dos itens.
           */
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

        USING target_invoices
          AS target_invoice

        WHERE
          invoice.id =
            target_invoice.id

          /*
           * Força a exclusão dos itens
           * antes da exclusão das faturas.
           */
          AND (
            SELECT COUNT(*)
            FROM deleted_invoice_items
          ) >= 0

        RETURNING invoice.id
      ),

      deleted_project AS (
        DELETE FROM
          public.projects
          AS project

        WHERE
          project.id = (
            SELECT id
            FROM target_project
          )

          AND (
            SELECT
              report_entries_count

            FROM dependency_counts
          ) = 0

          /*
           * Força a exclusão das faturas
           * antes da exclusão do projeto.
           */
          AND (
            SELECT COUNT(*)
            FROM deleted_invoices
          ) >= 0

        RETURNING project.id
      )

      SELECT
        dependency.project_exists,

        dependency.report_entries_count,

        dependency.invoices_count,

        (
          SELECT COUNT(*)
          FROM deleted_invoices
        ) AS deleted_invoices_count,

        EXISTS (
          SELECT 1
          FROM deleted_project
        ) AS project_deleted

      FROM dependency_counts
        AS dependency
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

          deleted_invoices_count:
            | number
            | string;

          project_deleted: boolean;
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

    const deletedInvoicesCount =
      Number(
        result.deleted_invoices_count
      );

    if (reportEntriesCount > 0) {
      return {
        success: false,

        message:
          `O projeto não pode ser excluído porque possui ${reportEntriesCount} lançamento${
            reportEntriesCount === 1
              ? ''
              : 's'
          }. Exclua ou transfira os lançamentos antes de continuar.`,
      };
    }

    if (!result.project_deleted) {
      return {
        success: false,
        message:
          'Não foi possível excluir o projeto.',
      };
    }

    revalidatePath('/dashboard');
    revalidatePath('/projetos');
    revalidatePath('/relatorios');
    revalidatePath('/faturas');

    return {
      success: true,

      message:
        invoicesCount > 0
          ? `Projeto excluído com sucesso. ${deletedInvoicesCount} fatura${
              deletedInvoicesCount === 1
                ? ''
                : 's'
            } também ${
              deletedInvoicesCount === 1
                ? 'foi excluída'
                : 'foram excluídas'
            }.`
          : 'Projeto excluído com sucesso.',
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

    if (
      databaseError.code ===
      '23503'
    ) {
      return {
        success: false,

        message:
          'O projeto ainda possui registros relacionados que impedem sua exclusão.',
      };
    }

    return {
      success: false,
      message:
        'Não foi possível excluir o projeto.',
    };
  }
}