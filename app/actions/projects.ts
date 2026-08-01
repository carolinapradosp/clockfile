// app/actions/projects.ts

'use server';

import { revalidatePath } from 'next/cache';

import { sql } from '@/lib/db';
import { getCurrentAppUserId } from '@/lib/users/get-current-app-user';

import type {
  Project,
  ProjectActionState,
  ProjectFormData,
  ProjectStatus,
} from '@/interfaces/Project';

type ProjectRow = {
  id: string;

  client_id: string;
  client_name: string;
  client_company_name: string | null;

  name: string;
  description: string | null;

  default_hourly_rate: string | number | null;
  currency: string;

  status: ProjectStatus;

  start_date: string | Date | null;
  end_date: string | Date | null;

  created_at: string | Date;
  updated_at: string | Date;
};

type ProjectClientOptionRow = {
  id: string;
  name: string;
  company_name: string | null;
};

export type ProjectClientOption = {
  id: string;
  name: string;
  companyName: string | null;
};

const VALID_STATUSES: ProjectStatus[] = [
  'draft',
  'active',
  'paused',
  'completed',
  'archived',
];

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function normalizeDateTime(
  value: string | Date
): string {
  return value instanceof Date
    ? value.toISOString()
    : String(value);
}

function normalizeDate(
  value: string | Date | null
): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function mapProjectRow(
  row: ProjectRow
): Project {
  return {
    id: String(row.id),

    clientId: String(row.client_id),
    clientName: row.client_name,
    clientCompanyName:
      row.client_company_name,

    name: row.name,
    description: row.description,

    defaultHourlyRate:
      row.default_hourly_rate === null
        ? null
        : Number(row.default_hourly_rate),

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

function requiredText(
  value: FormDataEntryValue | null
): string {
  return typeof value === 'string'
    ? value.trim()
    : '';
}

function optionalText(
  value: string
): string | null {
  const normalized = value.trim();

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
  const clientId = requiredText(
    formData.get('clientId')
  );

  const name = requiredText(
    formData.get('name')
  );

  const description = requiredText(
    formData.get('description')
  );

  const defaultHourlyRate =
    requiredText(
      formData.get('defaultHourlyRate')
    );

  const currency = requiredText(
    formData.get('currency')
  ).toUpperCase();

  const rawStatus = requiredText(
    formData.get('status')
  ) as ProjectStatus;

  const startDate = requiredText(
    formData.get('startDate')
  );

  const endDate = requiredText(
    formData.get('endDate')
  );

  const status =
    VALID_STATUSES.includes(rawStatus)
      ? rawStatus
      : 'active';

  const fieldErrors: Partial<
    Record<keyof ProjectFormData, string>
  > = {};

  if (!clientId) {
    fieldErrors.clientId =
      'Selecione um cliente.';
  } else if (!isValidUuid(clientId)) {
    fieldErrors.clientId =
      'O cliente selecionado é inválido.';
  }

  if (!name) {
    fieldErrors.name =
      'Informe o nome do projeto.';
  }

  if (
    currency.length !== 3
  ) {
    fieldErrors.currency =
      'Informe uma moeda com 3 letras.';
  }

  if (defaultHourlyRate) {
    const hourlyRate = Number(
      defaultHourlyRate
    );

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
    Object.keys(fieldErrors).length > 0
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
      clientId,
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

async function clientBelongsToOwner({
  clientId,
  ownerId,
}: {
  clientId: string;
  ownerId: string;
}): Promise<boolean> {
  const rows = await sql`
    SELECT id
    FROM public.clients
    WHERE
      id = ${clientId}::uuid
      AND owner_id = ${ownerId}::uuid
      AND status <> 'archived'
    LIMIT 1
  `;

  return Boolean(rows[0]);
}

export async function getProjectClientOptions(): Promise<
  ProjectClientOption[]
> {
  const ownerId =
    await getCurrentAppUserId();

  const rows = await sql`
    SELECT
      id,
      name,
      company_name
    FROM public.clients
    WHERE
      owner_id = ${ownerId}::uuid
      AND status <> 'archived'
    ORDER BY
      company_name ASC NULLS LAST,
      name ASC
  `;

  return (
    rows as ProjectClientOptionRow[]
  ).map((row) => ({
    id: String(row.id),
    name: row.name,
    companyName: row.company_name,
  }));
}

export async function getProjects({
  includeArchived = false,
  clientId,
}: {
  includeArchived?: boolean;
  clientId?: string;
} = {}): Promise<Project[]> {
  const ownerId =
    await getCurrentAppUserId();

  if (
    clientId &&
    !isValidUuid(clientId)
  ) {
    return [];
  }

  const rows = await sql`
    SELECT
      project.id,
      project.client_id,

      client.name AS client_name,
      client.company_name
        AS client_company_name,

      project.name,
      project.description,

      project.default_hourly_rate,
      project.currency,
      project.status,

      project.start_date,
      project.end_date,

      project.created_at,
      project.updated_at

    FROM public.projects project

    INNER JOIN public.clients client
      ON client.id =
        project.client_id

    WHERE
      client.owner_id =
        ${ownerId}::uuid

      AND (
        ${includeArchived}
        OR project.status <>
          'archived'
      )

      AND (
        ${clientId ?? null}::uuid
          IS NULL
        OR project.client_id =
          ${clientId ?? null}::uuid
      )

    ORDER BY
      project.created_at DESC,
      project.name ASC
  `;

  return (rows as ProjectRow[]).map(
    mapProjectRow
  );
}

export async function getProjectById(
  projectId: string
): Promise<Project | null> {
  if (!isValidUuid(projectId)) {
    return null;
  }

  const ownerId =
    await getCurrentAppUserId();

  const rows = await sql`
    SELECT
      project.id,
      project.client_id,

      client.name AS client_name,
      client.company_name
        AS client_company_name,

      project.name,
      project.description,

      project.default_hourly_rate,
      project.currency,
      project.status,

      project.start_date,
      project.end_date,

      project.created_at,
      project.updated_at

    FROM public.projects project

    INNER JOIN public.clients client
      ON client.id =
        project.client_id

    WHERE
      project.id =
        ${projectId}::uuid

      AND client.owner_id =
        ${ownerId}::uuid

    LIMIT 1
  `;

  const project =
    rows[0] as ProjectRow | undefined;

  return project
    ? mapProjectRow(project)
    : null;
}

export async function createProject(
  _previousState: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  try {
    const parsed =
      parseProjectFormData(formData);

    if (!parsed.success) {
      return parsed.result;
    }

    const ownerId =
      await getCurrentAppUserId();

    const data = parsed.data;

    const validClient =
      await clientBelongsToOwner({
        clientId: data.clientId,
        ownerId,
      });

    if (!validClient) {
      return {
        success: false,
        message:
          'O cliente selecionado não foi encontrado.',
        fieldErrors: {
          clientId:
            'Selecione um cliente válido.',
        },
      };
    }

    const hourlyRate =
      data.defaultHourlyRate
        ? Number(
            data.defaultHourlyRate
          )
        : null;

    const rows = await sql`
      INSERT INTO public.projects (
        client_id,
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
        ${data.clientId}::uuid,
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

    const created = rows[0] as
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
    revalidatePath(
      `/clientes/${data.clientId}`
    );

    return {
      success: true,
      message:
        'Projeto cadastrado com sucesso.',
      projectId: String(created.id),
    };
  } catch (error) {
    console.error(
      'Erro ao criar projeto:',
      error
    );

    const databaseError =
      error as {
        code?: string;
        constraint?: string;
      };

    if (
      databaseError.code === '23505'
    ) {
      return {
        success: false,
        message:
          'Já existe um projeto com esse nome para o cliente selecionado.',
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
  _previousState: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  try {
    if (!isValidUuid(projectId)) {
      return {
        success: false,
        message:
          'Identificador do projeto inválido.',
      };
    }

    const parsed =
      parseProjectFormData(formData);

    if (!parsed.success) {
      return parsed.result;
    }

    const ownerId =
      await getCurrentAppUserId();

    const data = parsed.data;

    const validClient =
      await clientBelongsToOwner({
        clientId: data.clientId,
        ownerId,
      });

    if (!validClient) {
      return {
        success: false,
        message:
          'O cliente selecionado não foi encontrado.',
        fieldErrors: {
          clientId:
            'Selecione um cliente válido.',
        },
      };
    }

    const hourlyRate =
      data.defaultHourlyRate
        ? Number(
            data.defaultHourlyRate
          )
        : null;

    const rows = await sql`
      UPDATE public.projects
      SET
        client_id =
          ${data.clientId}::uuid,

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

        AND client_id IN (
          SELECT id
          FROM public.clients
          WHERE owner_id =
            ${ownerId}::uuid
        )

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
    revalidatePath(
      `/projetos/${projectId}`
    );
    revalidatePath(
      `/projetos/${projectId}/editar`
    );
    revalidatePath(
      `/clientes/${data.clientId}`
    );

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
      databaseError.code === '23505'
    ) {
      return {
        success: false,
        message:
          'Já existe um projeto com esse nome para o cliente selecionado.',
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

export async function archiveProject(
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
      await getCurrentAppUserId();

    const rows = await sql`
      UPDATE public.projects
      SET
        status = 'archived',
        updated_at = NOW()

      WHERE
        id = ${projectId}::uuid

        AND client_id IN (
          SELECT id
          FROM public.clients
          WHERE owner_id =
            ${ownerId}::uuid
        )

      RETURNING
        id,
        client_id
    `;

    const archived = rows[0] as
      | {
          id: string;
          client_id: string;
        }
      | undefined;

    if (!archived) {
      return {
        success: false,
        message:
          'Projeto não encontrado.',
      };
    }

    revalidatePath('/projetos');

    revalidatePath(
      `/clientes/${archived.client_id}`
    );

    return {
      success: true,
      message:
        'Projeto arquivado com sucesso.',
    };
  } catch (error) {
    console.error(
      'Erro ao arquivar projeto:',
      error
    );

    return {
      success: false,
      message:
        'Não foi possível arquivar o projeto.',
    };
  }
}