// app/actions/report.ts

'use server';

import { revalidatePath } from 'next/cache';

import { sql } from '@/lib/db';
import { getCurrentAppUserId } from '@/lib/users/get-current-app-user';
import {
  durationToMinutes,
  minutesToDuration,
} from '@/lib/time';

import type {
  ReportEntry,
  ReportEntryActionState,
  ReportEntryFormData,
  ReportProjectOption,
} from '@/interfaces/ReportEntry';

type ProjectReportSummaryRow = {
  entries_count: number | string;
  total_minutes: number | string | null;
  total_amount: number | string | null;
  currency: string | null;
};

export type ProjectReportSummary = {
  entriesCount: number;
  totalMinutes: number;
  totalAmount: number;
  currency: string;
  recentEntries: ReportEntry[];
};

type ReportEntryRow = {
  id: string;

  project_id: string | null;
  project_name: string | null;

  client_id: string | null;
  client_name: string | null;
  client_company_name: string | null;

  task: string;
  description: string;

  date: string | Date;

  duration: string | null;
  duration_minutes:
    | number
    | string
    | null;

  rate:
    | number
    | string
    | null;

  amount:
    | number
    | string
    | null;

  currency: string | null;

  created_at: string | Date;
  updated_at: string | Date;
};

type ProjectOptionRow = {
  id: string;
  name: string;

  client_id: string;
  client_name: string;
  client_company_name: string | null;

  default_hourly_rate:
    | number
    | string
    | null;

  currency: string;
};

const MINIMUM_DURATION_MINUTES = 1;

function isValidUuid(
  value: string
): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function isValidMonth(
  value: string
): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(
    value
  );
}

function isValidDate(
  value: string
): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return false;
  }

  const date = new Date(
    `${value}T00:00:00Z`
  );

  return !Number.isNaN(
    date.getTime()
  );
}

function normalizeDate(
  value: string | Date
): string {
  if (value instanceof Date) {
    return value
      .toISOString()
      .slice(0, 10);
  }

  return String(value).slice(
    0,
    10
  );
}

function normalizeDateTime(
  value: string | Date
): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

function requiredText(
  value: FormDataEntryValue | null
): string {
  return typeof value === 'string'
    ? value.trim()
    : '';
}

function mapReportEntry(
  row: ReportEntryRow
): ReportEntry {
  const storedMinutes = Number(
    row.duration_minutes
  );

  const durationMinutes =
    Number.isSafeInteger(storedMinutes) &&
    storedMinutes >= 0
      ? storedMinutes
      : durationToMinutes(
          row.duration ?? ''
        );

  return {
    id: String(row.id),

    projectId: row.project_id
      ? String(row.project_id)
      : null,

    projectName:
      row.project_name,

    clientId: row.client_id
      ? String(row.client_id)
      : null,

    clientName: row.client_name,

    clientCompanyName:
      row.client_company_name,

    task: row.task,
    description: row.description,

    date: normalizeDate(row.date),

    duration:
      row.duration ||
      minutesToDuration(
        durationMinutes
      ),

    durationMinutes,

    rate:
      row.rate === null
        ? null
        : Number(row.rate),

    amount:
      row.amount === null
        ? 0
        : Number(row.amount),

    currency:
      row.currency ?? 'USD',

    createdAt: normalizeDateTime(
      row.created_at
    ),

    updatedAt: normalizeDateTime(
      row.updated_at
    ),
  };
}

function parseFormData(
  formData: FormData
):
  | {
      success: true;
      data: ReportEntryFormData;
      durationMinutes: number;
      rate: number;
    }
  | {
      success: false;
      result: ReportEntryActionState;
    } {
  const projectId =
    requiredText(
      formData.get('projectId')
    );

  const task = requiredText(
    formData.get('task')
  );

  const description =
    requiredText(
      formData.get('description')
    );

  const date = requiredText(
    formData.get('date')
  );

  const duration =
    requiredText(
      formData.get('duration')
    );

  const rateText =
    requiredText(
      formData.get('rate')
    );

  const fieldErrors: Partial<
    Record<
      keyof ReportEntryFormData,
      string
    >
  > = {};

  if (!projectId) {
    fieldErrors.projectId =
      'Selecione um projeto.';
  } else if (
    !isValidUuid(projectId)
  ) {
    fieldErrors.projectId =
      'O projeto selecionado é inválido.';
  }

  if (!task) {
    fieldErrors.task =
      'Informe a tarefa.';
  }

  if (!description) {
    fieldErrors.description =
      'Informe a descrição da atividade.';
  }

  if (!date) {
    fieldErrors.date =
      'Informe a data.';
  } else if (!isValidDate(date)) {
    fieldErrors.date =
      'Informe uma data válida.';
  }

  const durationMinutes =
    durationToMinutes(duration);

  if (!duration) {
    fieldErrors.duration =
      'Informe a duração.';
  } else if (
    durationMinutes <
    MINIMUM_DURATION_MINUTES
  ) {
    fieldErrors.duration =
      'Informe uma duração válida no formato HH:MM.';
  }

  const rate = Number(rateText);

  if (!rateText) {
    fieldErrors.rate =
      'Informe o valor por hora.';
  } else if (
    !Number.isFinite(rate) ||
    rate < 0
  ) {
    fieldErrors.rate =
      'Informe um valor por hora válido.';
  }

  if (
    Object.keys(fieldErrors)
      .length > 0
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
      projectId,
      task,
      description,
      date,
      duration,
      rate: rateText,
    },

    durationMinutes,
    rate,
  };
}

async function getOwnedProject({
  projectId,
  ownerId,
}: {
  projectId: string;
  ownerId: string;
}) {
  const rows = await sql`
    SELECT
      project.id,
      project.default_hourly_rate,
      project.currency

    FROM public.projects project

    INNER JOIN public.clients client
      ON client.id =
        project.client_id

    WHERE
      project.id =
        ${projectId}::uuid

      AND client.owner_id =
        ${ownerId}::uuid

      AND project.status <>
        'archived'

    LIMIT 1
  `;

  return rows[0] as
    | {
        id: string;

        default_hourly_rate:
          | number
          | string
          | null;

        currency: string;
      }
    | undefined;
}

export async function getReportProjectOptions(): Promise<
  ReportProjectOption[]
> {
  const ownerId =
    await getCurrentAppUserId();

  const rows = await sql`
    SELECT
      project.id,
      project.name,

      client.id AS client_id,
      client.name AS client_name,

      client.company_name
        AS client_company_name,

      project.default_hourly_rate,
      project.currency

    FROM public.projects project

    INNER JOIN public.clients client
      ON client.id =
        project.client_id

    WHERE
      client.owner_id =
        ${ownerId}::uuid

      AND client.status <>
        'archived'

      AND project.status <>
        'archived'

    ORDER BY
      client.company_name
        ASC NULLS LAST,

      client.name ASC,
      project.name ASC
  `;

  return (
    rows as ProjectOptionRow[]
  ).map((row) => ({
    id: String(row.id),
    name: row.name,

    clientId: String(
      row.client_id
    ),

    clientName:
      row.client_name,

    clientCompanyName:
      row.client_company_name,

    defaultHourlyRate:
      row.default_hourly_rate ===
      null
        ? null
        : Number(
            row.default_hourly_rate
          ),

    currency:
      row.currency,
  }));
}

export async function getReportEntries({
  month,
  projectId,
}: {
  month?: string;
  projectId?: string;
} = {}): Promise<ReportEntry[]> {
  const ownerId =
    await getCurrentAppUserId();

  const selectedMonth =
    month &&
    isValidMonth(month)
      ? month
      : new Date()
          .toISOString()
          .slice(0, 7);

  if (
    projectId &&
    !isValidUuid(projectId)
  ) {
    return [];
  }

  const startDate =
    `${selectedMonth}-01`;

  const [year, monthNumber] =
    selectedMonth
      .split('-')
      .map(Number);

  const endDate = new Date(
    Date.UTC(
      year,
      monthNumber,
      0
    )
  )
    .toISOString()
    .slice(0, 10);

  let rows;

  if (projectId) {
    rows = await sql`
      SELECT
        entry.id,

        entry.project_id,
        project.name
          AS project_name,

        client.id
          AS client_id,

        client.name
          AS client_name,

        client.company_name
          AS client_company_name,

        entry.task,
        entry.description,
        entry.date,

        entry.duration,
        entry.duration_minutes,

        entry.rate,
        entry.amount,

        COALESCE(
          entry.currency,
          project.currency,
          'USD'
        ) AS currency,

        entry.created_at,
        entry.updated_at

      FROM public.report_entries entry

      INNER JOIN public.projects project
        ON project.id =
          entry.project_id

      INNER JOIN public.clients client
        ON client.id =
          project.client_id

      WHERE
        client.owner_id =
          ${ownerId}::uuid

        AND entry.project_id =
          ${projectId}::uuid

        AND entry.date BETWEEN
          ${startDate}::date
          AND ${endDate}::date

      ORDER BY
        entry.date DESC,
        entry.created_at DESC
    `;
  } else {
    /*
     * O LEFT JOIN mantém visíveis os registros
     * antigos que ainda não possuem project_id.
     *
     * Depois que eles forem migrados para um
     * projeto, podemos tornar project_id obrigatório.
     */
    rows = await sql`
      SELECT
        entry.id,

        entry.project_id,
        project.name
          AS project_name,

        client.id
          AS client_id,

        client.name
          AS client_name,

        client.company_name
          AS client_company_name,

        entry.task,
        entry.description,
        entry.date,

        entry.duration,
        entry.duration_minutes,

        entry.rate,
        entry.amount,

        COALESCE(
          entry.currency,
          project.currency,
          'USD'
        ) AS currency,

        entry.created_at,
        entry.updated_at

      FROM public.report_entries entry

      LEFT JOIN public.projects project
        ON project.id =
          entry.project_id

      LEFT JOIN public.clients client
        ON client.id =
          project.client_id

      WHERE
        entry.date BETWEEN
          ${startDate}::date
          AND ${endDate}::date

        AND (
          client.owner_id =
            ${ownerId}::uuid

          OR entry.project_id
            IS NULL
        )

      ORDER BY
        entry.date DESC,
        entry.created_at DESC
    `;
  }

  return (
    rows as ReportEntryRow[]
  ).map(mapReportEntry);
}

export async function getReportEntryById(
  entryId: string
): Promise<ReportEntry | null> {
  if (!isValidUuid(entryId)) {
    return null;
  }

  const ownerId =
    await getCurrentAppUserId();

  const rows = await sql`
    SELECT
      entry.id,

      entry.project_id,
      project.name
        AS project_name,

      client.id
        AS client_id,

      client.name
        AS client_name,

      client.company_name
        AS client_company_name,

      entry.task,
      entry.description,
      entry.date,

      entry.duration,
      entry.duration_minutes,

      entry.rate,
      entry.amount,

      COALESCE(
        entry.currency,
        project.currency,
        'USD'
      ) AS currency,

      entry.created_at,
      entry.updated_at

    FROM public.report_entries entry

    LEFT JOIN public.projects project
      ON project.id =
        entry.project_id

    LEFT JOIN public.clients client
      ON client.id =
        project.client_id

    WHERE
      entry.id =
        ${entryId}::uuid

      AND (
        client.owner_id =
          ${ownerId}::uuid

        OR entry.project_id
          IS NULL
      )

    LIMIT 1
  `;

  const entry =
    rows[0] as
      | ReportEntryRow
      | undefined;

  return entry
    ? mapReportEntry(entry)
    : null;
}

export async function createReportEntry(
  _previousState: ReportEntryActionState,
  formData: FormData
): Promise<ReportEntryActionState> {
  try {
    const parsed =
      parseFormData(formData);

    if (!parsed.success) {
      return parsed.result;
    }

    const ownerId =
      await getCurrentAppUserId();

    const project =
      await getOwnedProject({
        projectId:
          parsed.data.projectId,

        ownerId,
      });

    if (!project) {
      return {
        success: false,
        message:
          'O projeto selecionado não foi encontrado.',
        fieldErrors: {
          projectId:
            'Selecione um projeto válido.',
        },
      };
    }

    const amount =
      Math.round(
        (
          parsed.durationMinutes /
          60
        ) *
          parsed.rate *
          100
      ) / 100;

    const rows = await sql`
      INSERT INTO public.report_entries (
        project_id,

        task,
        description,

        date,

        duration,
        duration_minutes,

        rate,
        amount,
        currency,

        created_at,
        updated_at
      )
      VALUES (
        ${parsed.data.projectId}::uuid,

        ${parsed.data.task},
        ${parsed.data.description},

        ${parsed.data.date}::date,

        ${parsed.data.duration},
        ${parsed.durationMinutes},

        ${parsed.rate},
        ${amount},
        ${project.currency},

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
        'Lançamento não retornado após a criação.'
      );
    }

    revalidatePath('/relatorios');
    revalidatePath(
      `/projetos/${parsed.data.projectId}`
    );

    return {
      success: true,
      message:
        'Lançamento salvo com sucesso.',
      entryId: String(created.id),
    };
  } catch (error) {
    console.error(
      'Erro ao criar lançamento:',
      error
    );

    return {
      success: false,
      message:
        'Não foi possível salvar o lançamento.',
    };
  }
}

export async function updateReportEntry(
  entryId: string,
  _previousState: ReportEntryActionState,
  formData: FormData
): Promise<ReportEntryActionState> {
  try {
    if (!isValidUuid(entryId)) {
      return {
        success: false,
        message:
          'Identificador do lançamento inválido.',
      };
    }

    const parsed =
      parseFormData(formData);

    if (!parsed.success) {
      return parsed.result;
    }

    const ownerId =
      await getCurrentAppUserId();

    const project =
      await getOwnedProject({
        projectId:
          parsed.data.projectId,

        ownerId,
      });

    if (!project) {
      return {
        success: false,
        message:
          'O projeto selecionado não foi encontrado.',
        fieldErrors: {
          projectId:
            'Selecione um projeto válido.',
        },
      };
    }

    const amount =
      Math.round(
        (
          parsed.durationMinutes /
          60
        ) *
          parsed.rate *
          100
      ) / 100;

    const rows = await sql`
      UPDATE public.report_entries
      SET
        project_id =
          ${parsed.data.projectId}::uuid,

        task =
          ${parsed.data.task},

        description =
          ${parsed.data.description},

        date =
          ${parsed.data.date}::date,

        duration =
          ${parsed.data.duration},

        duration_minutes =
          ${parsed.durationMinutes},

        rate =
          ${parsed.rate},

        amount =
          ${amount},

        currency =
          ${project.currency},

        updated_at = NOW()

      WHERE
        id = ${entryId}::uuid

        AND (
          project_id IS NULL

          OR project_id IN (
            SELECT project.id

            FROM public.projects project

            INNER JOIN public.clients client
              ON client.id =
                project.client_id

            WHERE client.owner_id =
              ${ownerId}::uuid
          )
        )

      RETURNING id
    `;

    if (!rows[0]) {
      return {
        success: false,
        message:
          'Lançamento não encontrado.',
      };
    }

    revalidatePath('/relatorios');
    revalidatePath(
      `/relatorios/${entryId}/editar`
    );
    revalidatePath(
      `/projetos/${parsed.data.projectId}`
    );

    return {
      success: true,
      message:
        'Lançamento atualizado com sucesso.',
      entryId,
    };
  } catch (error) {
    console.error(
      'Erro ao atualizar lançamento:',
      error
    );

    return {
      success: false,
      message:
        'Não foi possível atualizar o lançamento.',
    };
  }
}

export async function deleteReportEntry(
  entryId: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!isValidUuid(entryId)) {
      return {
        success: false,
        message:
          'Identificador do lançamento inválido.',
      };
    }

    const ownerId =
      await getCurrentAppUserId();

    const rows = await sql`
      DELETE FROM public.report_entries
      WHERE
        id = ${entryId}::uuid

        AND (
          project_id IS NULL

          OR project_id IN (
            SELECT project.id

            FROM public.projects project

            INNER JOIN public.clients client
              ON client.id =
                project.client_id

            WHERE client.owner_id =
              ${ownerId}::uuid
          )
        )

      RETURNING
        id,
        project_id
    `;

    const deleted = rows[0] as
      | {
          id: string;
          project_id: string | null;
        }
      | undefined;

    if (!deleted) {
      return {
        success: false,
        message:
          'Lançamento não encontrado.',
      };
    }

    revalidatePath('/relatorios');

    if (deleted.project_id) {
      revalidatePath(
        `/projetos/${deleted.project_id}`
      );
    }

    return {
      success: true,
      message:
        'Lançamento excluído com sucesso.',
    };
  } catch (error) {
    console.error(
      'Erro ao excluir lançamento:',
      error
    );

    return {
      success: false,
      message:
        'Não foi possível excluir o lançamento.',
    };
  }
}

export async function getProjectReportSummary(
  projectId: string
): Promise<ProjectReportSummary | null> {
  if (!isValidUuid(projectId)) {
    return null;
  }

  const ownerId =
    await getCurrentAppUserId();

  const projectRows = await sql`
    SELECT
      project.id,
      project.currency
    FROM public.projects project

    INNER JOIN public.clients client
      ON client.id = project.client_id

    WHERE
      project.id = ${projectId}::uuid
      AND client.owner_id = ${ownerId}::uuid

    LIMIT 1
  `;

  const project = projectRows[0] as
    | {
        id: string;
        currency: string;
      }
    | undefined;

  if (!project) {
    return null;
  }

  const summaryRows = await sql`
    SELECT
      COUNT(*) AS entries_count,

      COALESCE(
        SUM(
          COALESCE(
            duration_minutes,
            (
              split_part(duration, ':', 1)::INTEGER * 60
              + split_part(duration, ':', 2)::INTEGER
            )
          )
        ),
        0
      ) AS total_minutes,

      COALESCE(
        SUM(amount),
        0
      ) AS total_amount,

      ${project.currency}::text AS currency

    FROM public.report_entries
    WHERE project_id = ${projectId}::uuid
  `;

  const summary =
    summaryRows[0] as
      | ProjectReportSummaryRow
      | undefined;

  const recentRows = await sql`
    SELECT
      entry.id,

      entry.project_id,
      project.name AS project_name,

      client.id AS client_id,
      client.name AS client_name,
      client.company_name
        AS client_company_name,

      entry.task,
      entry.description,
      entry.date,

      entry.duration,
      entry.duration_minutes,

      entry.rate,
      entry.amount,

      COALESCE(
        entry.currency,
        project.currency,
        'USD'
      ) AS currency,

      entry.created_at,
      entry.updated_at

    FROM public.report_entries entry

    INNER JOIN public.projects project
      ON project.id = entry.project_id

    INNER JOIN public.clients client
      ON client.id = project.client_id

    WHERE
      entry.project_id = ${projectId}::uuid
      AND client.owner_id = ${ownerId}::uuid

    ORDER BY
      entry.date DESC,
      entry.created_at DESC

    LIMIT 5
  `;

  return {
    entriesCount:
      Number(summary?.entries_count ?? 0),

    totalMinutes:
      Number(summary?.total_minutes ?? 0),

    totalAmount:
      Number(summary?.total_amount ?? 0),

    currency:
      summary?.currency ??
      project.currency ??
      'USD',

    recentEntries: (
      recentRows as ReportEntryRow[]
    ).map(mapReportEntry),
  };
}