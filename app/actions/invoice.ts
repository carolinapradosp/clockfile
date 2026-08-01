// app/actions/invoice.ts

'use server';

import { revalidatePath } from 'next/cache';

import { sql } from '@/lib/db';
import { getCurrentAppUserId } from '@/lib/users/get-current-app-user';

import type {
  Invoice,
  InvoiceClientOption,
  InvoiceFilters,
  InvoiceItemInput,
  InvoiceItemSource,
  InvoiceProjectOption,
  InvoiceReportEntryOption,
  InvoiceStatus,
  InvoiceStatusResult,
  InvoiceSummary,
  SaveInvoiceInput,
  SaveInvoiceResult,
  SavedInvoiceItem,
} from '@/interfaces/Invoice';

type InvoiceRow = {
  id: string;
  invoice_number: string | number;

  client_id: string | null;
  client_name: string | null;
  client_company_name: string | null;

  project_id: string | null;
  project_name: string | null;

  reference_month: string;
  invoice_date: string | Date;
  due_date: string | Date | null;

  currency: string;

  tax_percentage: string | number;
  subtotal: string | number;
  tax_amount: string | number;
  total_amount: string | number;

  status: InvoiceStatus;
  notes: string | null;

  bill_to_name: string | null;
  bill_to_company: string | null;
  bill_to_email: string | null;
  bill_to_phone: string | null;

  bill_to_address_line_1: string | null;
  bill_to_address_line_2: string | null;
  bill_to_city: string | null;
  bill_to_state: string | null;
  bill_to_postal_code: string | null;
  bill_to_country_code: string | null;

  issued_at: string | Date | null;
  sent_at: string | Date | null;
  paid_at: string | Date | null;
  cancelled_at: string | Date | null;

  created_at: string | Date;
  updated_at: string | Date;
};

type InvoiceItemRow = {
  id: string;

  description: string;
  link: string | null;

  quantity: string | number | null;
  rate: string | number | null;
  amount: string | number;

  source: InvoiceItemSource;
  position: string | number;

  report_entry_ids: string[] | null;
};

type InvoiceClientOptionRow = {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
};

type InvoiceProjectOptionRow = {
  id: string;
  client_id: string;

  name: string;
  client_name: string;
  client_company_name: string | null;

  default_hourly_rate: string | number | null;
  currency: string;
};

type InvoiceReportEntryRow = {
  id: string;
  project_id: string;

  task: string;
  description: string;

  date: string | Date;

  duration: string | null;
  duration_minutes: string | number | null;

  rate: string | number | null;
  amount: string | number | null;
  currency: string | null;
};

type ClientSnapshotRow = {
  id: string;

  name: string;
  company_name: string | null;

  email: string | null;
  phone: string | null;

  address_line_1: string | null;
  address_line_2: string | null;

  city: string | null;
  state: string | null;
  postal_code: string | null;
  country_code: string | null;
};

const VALID_STATUSES: InvoiceStatus[] = [
  'draft',
  'issued',
  'sent',
  'paid',
  'overdue',
  'cancelled',
];

const VALID_ITEM_SOURCES: InvoiceItemSource[] = [
  'monthly-report',
  'manual',
  'expense',
  'adjustment',
];

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function isValidMonth(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(
    value
  );
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return !Number.isNaN(
    new Date(`${value}T00:00:00Z`).getTime()
  );
}

function isValidCurrency(value: string): boolean {
  return /^[A-Z]{3}$/.test(value);
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

function normalizeDateTime(
  value: string | Date | null
): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

function durationToMinutes(
  duration: string | null
): number {
  if (!duration) {
    return 0;
  }

  const match = /^(\d+):([0-5]\d)$/.exec(
    duration
  );

  if (!match) {
    return 0;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function minutesToDuration(
  totalMinutes: number
): string {
  const safeMinutes =
    Number.isSafeInteger(totalMinutes) &&
    totalMinutes >= 0
      ? totalMinutes
      : 0;

  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  return `${String(hours).padStart(
    2,
    '0'
  )}:${String(minutes).padStart(2, '0')}`;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function mapInvoiceRow(
  row: InvoiceRow
): InvoiceSummary {
  return {
    id: String(row.id),
    invoiceNumber: String(row.invoice_number),

    clientId: row.client_id
      ? String(row.client_id)
      : null,

    clientName: row.client_name,
    clientCompanyName: row.client_company_name,

    projectId: row.project_id
      ? String(row.project_id)
      : null,

    projectName: row.project_name,

    referenceMonth: row.reference_month,

    invoiceDate:
      normalizeDate(row.invoice_date) ?? '',

    dueDate: normalizeDate(row.due_date),

    currency: row.currency,

    taxPercentage: Number(
      row.tax_percentage
    ),

    subtotal: Number(row.subtotal),
    taxAmount: Number(row.tax_amount),
    totalAmount: Number(row.total_amount),

    status: row.status,
    notes: row.notes,

    issuedAt: normalizeDateTime(row.issued_at),
    sentAt: normalizeDateTime(row.sent_at),
    paidAt: normalizeDateTime(row.paid_at),

    cancelledAt: normalizeDateTime(
      row.cancelled_at
    ),

    createdAt:
      normalizeDateTime(row.created_at) ?? '',

    updatedAt:
      normalizeDateTime(row.updated_at) ?? '',
  };
}

function mapInvoiceItem(
  row: InvoiceItemRow
): SavedInvoiceItem {
  return {
    id: String(row.id),

    description: row.description,
    link: row.link,

    quantity:
      row.quantity === null
        ? null
        : Number(row.quantity),

    rate:
      row.rate === null
        ? null
        : Number(row.rate),

    amount: Number(row.amount),

    source: row.source,
    position: Number(row.position),

    reportEntryIds:
      row.report_entry_ids?.map(String) ?? [],
  };
}

function validateAndNormalizeItems(
  items: InvoiceItemInput[]
):
  | {
      success: true;
      items: InvoiceItemInput[];
      subtotal: number;
    }
  | {
      success: false;
      message: string;
    } {
  const normalizedItems = items
    .map((item, index) => {
      const quantity =
        item.quantity === null
          ? null
          : Number(item.quantity);

      const rate =
        item.rate === null
          ? null
          : Number(item.rate);

      let amount = Number(item.amount);

      if (
        (!Number.isFinite(amount) ||
          amount < 0) &&
        quantity !== null &&
        rate !== null
      ) {
        amount = roundCurrency(quantity * rate);
      }

      return {
        description: item.description.trim(),

        link: item.link?.trim() || null,

        quantity,
        rate,
        amount,

        source: item.source,

        position:
          Number.isSafeInteger(item.position) &&
          item.position >= 0
            ? item.position
            : index,

        reportEntryIds: Array.from(
          new Set(
            item.reportEntryIds.filter(
              isValidUuid
            )
          )
        ),
      };
    })
    .filter((item) => item.description);

  if (normalizedItems.length === 0) {
    return {
      success: false,
      message:
        'Adicione pelo menos um item à fatura.',
    };
  }

  for (const item of normalizedItems) {
    if (
      !VALID_ITEM_SOURCES.includes(item.source)
    ) {
      return {
        success: false,
        message:
          'Um dos itens possui uma origem inválida.',
      };
    }

    if (
      item.quantity !== null &&
      (!Number.isFinite(item.quantity) ||
        item.quantity < 0)
    ) {
      return {
        success: false,
        message:
          'A quantidade de um dos itens é inválida.',
      };
    }

    if (
      item.rate !== null &&
      (!Number.isFinite(item.rate) ||
        item.rate < 0)
    ) {
      return {
        success: false,
        message:
          'O rate de um dos itens é inválido.',
      };
    }

    if (
      !Number.isFinite(item.amount) ||
      item.amount < 0
    ) {
      return {
        success: false,
        message:
          'O valor de um dos itens é inválido.',
      };
    }

    if (
      item.source === 'monthly-report' &&
      item.reportEntryIds.length === 0
    ) {
      return {
        success: false,
        message:
          'O item de relatório não possui lançamentos vinculados.',
      };
    }
  }

  return {
    success: true,
    items: normalizedItems,
    subtotal: roundCurrency(
      normalizedItems.reduce(
        (total, item) => total + item.amount,
        0
      )
    ),
  };
}

async function getOwnedClient({
  clientId,
  ownerId,
}: {
  clientId: string;
  ownerId: string;
}): Promise<ClientSnapshotRow | null> {
  const rows = await sql`
    SELECT
      id,
      name,
      company_name,
      email,
      phone,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country_code
    FROM public.clients
    WHERE
      id = ${clientId}::uuid
      AND owner_id = ${ownerId}::uuid
      AND status <> 'archived'
    LIMIT 1
  `;

  return (
    (rows[0] as ClientSnapshotRow | undefined) ??
    null
  );
}

async function validateProject({
  projectId,
  clientId,
  ownerId,
}: {
  projectId: string;
  clientId: string;
  ownerId: string;
}): Promise<boolean> {
  const rows = await sql`
    SELECT project.id
    FROM public.projects project

    INNER JOIN public.clients client
      ON client.id = project.client_id

    WHERE
      project.id = ${projectId}::uuid
      AND project.client_id = ${clientId}::uuid
      AND client.owner_id = ${ownerId}::uuid
      AND project.status <> 'archived'

    LIMIT 1
  `;

  return Boolean(rows[0]);
}

async function invoiceBelongsToOwner({
  invoiceId,
  ownerId,
}: {
  invoiceId: string;
  ownerId: string;
}): Promise<boolean> {
  const rows = await sql`
    SELECT invoice.id
    FROM public.invoices invoice

    INNER JOIN public.clients client
      ON client.id = invoice.client_id

    WHERE
      invoice.id = ${invoiceId}::uuid
      AND client.owner_id = ${ownerId}::uuid

    LIMIT 1
  `;

  return Boolean(rows[0]);
}

export async function getInvoiceClientOptions(): Promise<
  InvoiceClientOption[]
> {
  const ownerId =
    await getCurrentAppUserId();

  const rows = await sql`
    SELECT
      id,
      name,
      company_name,
      email
    FROM public.clients
    WHERE
      owner_id = ${ownerId}::uuid
      AND status <> 'archived'
    ORDER BY
      company_name ASC NULLS LAST,
      name ASC
  `;

  return (
    rows as InvoiceClientOptionRow[]
  ).map((row) => ({
    id: String(row.id),
    name: row.name,
    companyName: row.company_name,
    email: row.email,
    currency: null,
  }));
}

export async function getInvoiceProjectOptions({
  clientId,
}: {
  clientId?: string;
} = {}): Promise<InvoiceProjectOption[]> {
  const ownerId =
    await getCurrentAppUserId();

  if (clientId && !isValidUuid(clientId)) {
    return [];
  }

  const rows = await sql`
    SELECT
      project.id,
      project.client_id,
      project.name,

      client.name AS client_name,
      client.company_name
        AS client_company_name,

      project.default_hourly_rate,
      project.currency

    FROM public.projects project

    INNER JOIN public.clients client
      ON client.id = project.client_id

    WHERE
      client.owner_id = ${ownerId}::uuid
      AND client.status <> 'archived'
      AND project.status <> 'archived'

      AND (
        ${clientId ?? null}::uuid IS NULL
        OR project.client_id =
          ${clientId ?? null}::uuid
      )

    ORDER BY
      client.company_name ASC NULLS LAST,
      client.name ASC,
      project.name ASC
  `;

  return (
    rows as InvoiceProjectOptionRow[]
  ).map((row) => ({
    id: String(row.id),
    clientId: String(row.client_id),

    name: row.name,

    clientName: row.client_name,

    clientCompanyName:
      row.client_company_name,

    defaultHourlyRate:
      row.default_hourly_rate === null
        ? null
        : Number(row.default_hourly_rate),

    currency: row.currency,
  }));
}

export async function getUnbilledReportEntries({
  projectId,
  month,
  invoiceId,
}: {
  projectId: string;
  month: string;
  invoiceId?: string;
}): Promise<InvoiceReportEntryOption[]> {
  if (
    !isValidUuid(projectId) ||
    !isValidMonth(month)
  ) {
    return [];
  }

  const ownerId =
    await getCurrentAppUserId();

  const startDate = `${month}-01`;

  const [year, monthNumber] = month
    .split('-')
    .map(Number);

  const endDate = new Date(
    Date.UTC(year, monthNumber, 0)
  )
    .toISOString()
    .slice(0, 10);

  /*
   * Durante a edição, os lançamentos que já
   * pertencem à própria fatura continuam disponíveis.
   */
  const rows = await sql`
    SELECT
      entry.id,
      entry.project_id,

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
      ) AS currency

    FROM public.report_entries entry

    INNER JOIN public.projects project
      ON project.id = entry.project_id

    INNER JOIN public.clients client
      ON client.id = project.client_id

    LEFT JOIN public.invoice_report_entries relation
      ON relation.report_entry_id = entry.id

    WHERE
      entry.project_id = ${projectId}::uuid

      AND client.owner_id = ${ownerId}::uuid

      AND entry.date >= ${startDate}::date
      AND entry.date < (
        ${endDate}::date
        + INTERVAL '1 day'
      )

      AND (
        relation.report_entry_id IS NULL

        OR relation.invoice_id =
          ${invoiceId ?? null}::uuid
      )

    ORDER BY
      entry.date ASC,
      entry.created_at ASC
  `;

  return (
    rows as InvoiceReportEntryRow[]
  ).map((row) => {
    const storedMinutes = Number(
      row.duration_minutes
    );

    const durationMinutes =
      Number.isSafeInteger(storedMinutes) &&
      storedMinutes >= 0
        ? storedMinutes
        : durationToMinutes(row.duration);

    return {
      id: String(row.id),

      projectId: String(row.project_id),

      task: row.task,
      description: row.description,

      date:
        normalizeDate(row.date) ?? '',

      duration:
        row.duration ||
        minutesToDuration(durationMinutes),

      durationMinutes,

      rate:
        row.rate === null
          ? null
          : Number(row.rate),

      amount:
        row.amount === null
          ? 0
          : Number(row.amount),

      currency: row.currency ?? 'USD',
    };
  });
}

export async function getInvoices(
  filters: InvoiceFilters = {}
): Promise<InvoiceSummary[]> {
  const ownerId =
    await getCurrentAppUserId();

  const {
    clientId,
    projectId,
    status,
    month,
  } = filters;

  if (clientId && !isValidUuid(clientId)) {
    return [];
  }

  if (projectId && !isValidUuid(projectId)) {
    return [];
  }

  if (
    status &&
    !VALID_STATUSES.includes(status)
  ) {
    return [];
  }

  if (month && !isValidMonth(month)) {
    return [];
  }

  const rows = await sql`
    SELECT
      invoice.id,
      invoice.invoice_number,

      invoice.client_id,
      client.name AS client_name,
      client.company_name
        AS client_company_name,

      invoice.project_id,
      project.name AS project_name,

      invoice.reference_month,
      invoice.invoice_date,
      invoice.due_date,

      invoice.currency,

      invoice.tax_percentage,
      invoice.subtotal,
      invoice.tax_amount,
      invoice.total_amount,

      invoice.status,
      invoice.notes,

      invoice.bill_to_name,
      invoice.bill_to_company,
      invoice.bill_to_email,
      invoice.bill_to_phone,

      invoice.bill_to_address_line_1,
      invoice.bill_to_address_line_2,
      invoice.bill_to_city,
      invoice.bill_to_state,
      invoice.bill_to_postal_code,
      invoice.bill_to_country_code,

      invoice.issued_at,
      invoice.sent_at,
      invoice.paid_at,
      invoice.cancelled_at,

      invoice.created_at,
      invoice.updated_at

    FROM public.invoices invoice

    INNER JOIN public.clients client
      ON client.id = invoice.client_id

    LEFT JOIN public.projects project
      ON project.id = invoice.project_id

    WHERE
      client.owner_id = ${ownerId}::uuid

      AND (
        ${clientId ?? null}::uuid IS NULL
        OR invoice.client_id =
          ${clientId ?? null}::uuid
      )

      AND (
        ${projectId ?? null}::uuid IS NULL
        OR invoice.project_id =
          ${projectId ?? null}::uuid
      )

      AND (
        ${status ?? null}::text IS NULL
        OR invoice.status =
          ${status ?? null}::text
      )

      AND (
        ${month ?? null}::text IS NULL
        OR invoice.reference_month =
          ${month ?? null}::text
      )

    ORDER BY
      invoice.invoice_date DESC,
      invoice.created_at DESC
  `;

  return (rows as InvoiceRow[]).map(
    mapInvoiceRow
  );
}

export async function getInvoiceById(
  invoiceId: string
): Promise<Invoice | null> {
  if (!isValidUuid(invoiceId)) {
    return null;
  }

  const ownerId =
    await getCurrentAppUserId();

  const rows = await sql`
    SELECT
      invoice.id,
      invoice.invoice_number,

      invoice.client_id,
      client.name AS client_name,
      client.company_name
        AS client_company_name,

      invoice.project_id,
      project.name AS project_name,

      invoice.reference_month,
      invoice.invoice_date,
      invoice.due_date,

      invoice.currency,

      invoice.tax_percentage,
      invoice.subtotal,
      invoice.tax_amount,
      invoice.total_amount,

      invoice.status,
      invoice.notes,

      invoice.bill_to_name,
      invoice.bill_to_company,
      invoice.bill_to_email,
      invoice.bill_to_phone,

      invoice.bill_to_address_line_1,
      invoice.bill_to_address_line_2,
      invoice.bill_to_city,
      invoice.bill_to_state,
      invoice.bill_to_postal_code,
      invoice.bill_to_country_code,

      invoice.issued_at,
      invoice.sent_at,
      invoice.paid_at,
      invoice.cancelled_at,

      invoice.created_at,
      invoice.updated_at

    FROM public.invoices invoice

    INNER JOIN public.clients client
      ON client.id = invoice.client_id

    LEFT JOIN public.projects project
      ON project.id = invoice.project_id

    WHERE
      invoice.id = ${invoiceId}::uuid
      AND client.owner_id = ${ownerId}::uuid

    LIMIT 1
  `;

  const row =
    rows[0] as InvoiceRow | undefined;

  if (!row) {
    return null;
  }

  const itemRows = await sql`
    SELECT
      item.id,

      item.description,
      item.link,

      item.quantity,
      item.rate,
      item.amount,

      item.source,
      item.position,

      COALESCE(
        ARRAY_AGG(
          relation.report_entry_id::text
          ORDER BY relation.created_at ASC
        ) FILTER (
          WHERE relation.report_entry_id IS NOT NULL
        ),
        ARRAY[]::text[]
      ) AS report_entry_ids

    FROM public.invoice_items item

    LEFT JOIN public.invoice_report_entries relation
      ON relation.invoice_item_id = item.id

    WHERE item.invoice_id = ${invoiceId}::uuid

    GROUP BY item.id

    ORDER BY
      item.position ASC,
      item.created_at ASC
  `;

  return {
    ...mapInvoiceRow(row),

    billTo: {
      name: row.bill_to_name,
      company: row.bill_to_company,
      email: row.bill_to_email,
      phone: row.bill_to_phone,

      addressLine1:
        row.bill_to_address_line_1,

      addressLine2:
        row.bill_to_address_line_2,

      city: row.bill_to_city,
      state: row.bill_to_state,

      postalCode:
        row.bill_to_postal_code,

      countryCode:
        row.bill_to_country_code,
    },

    items: (
      itemRows as InvoiceItemRow[]
    ).map(mapInvoiceItem),
  };
}

export async function saveInvoice(
  input: SaveInvoiceInput
): Promise<SaveInvoiceResult> {
  try {
    const ownerId =
      await getCurrentAppUserId();

    const invoiceId =
      input.invoiceId?.trim() || null;

    if (
      invoiceId &&
      !isValidUuid(invoiceId)
    ) {
      return {
        success: false,
        code: 'INVALID_INVOICE_ID',
        message:
          'O identificador da fatura é inválido.',
      };
    }

    if (!isValidUuid(input.clientId)) {
      return {
        success: false,
        code: 'INVALID_CLIENT',
        message:
          'Selecione um cliente válido.',
      };
    }

    if (
      input.projectId &&
      !isValidUuid(input.projectId)
    ) {
      return {
        success: false,
        code: 'INVALID_PROJECT',
        message:
          'Selecione um projeto válido.',
      };
    }

    if (!isValidMonth(input.referenceMonth)) {
      return {
        success: false,
        code: 'INVALID_REFERENCE_MONTH',
        message:
          'O mês de referência é inválido.',
      };
    }

    if (!isValidDate(input.invoiceDate)) {
      return {
        success: false,
        code: 'INVALID_INVOICE_DATE',
        message:
          'A data da fatura é inválida.',
      };
    }

    if (
      input.dueDate &&
      !isValidDate(input.dueDate)
    ) {
      return {
        success: false,
        code: 'INVALID_DUE_DATE',
        message:
          'A data de vencimento é inválida.',
      };
    }

    if (
      input.dueDate &&
      input.dueDate < input.invoiceDate
    ) {
      return {
        success: false,
        code: 'DUE_DATE_BEFORE_INVOICE',
        message:
          'O vencimento não pode ser anterior à data da fatura.',
      };
    }

    const currency = input.currency
      .trim()
      .toUpperCase();

    if (!isValidCurrency(currency)) {
      return {
        success: false,
        code: 'INVALID_CURRENCY',
        message:
          'Informe uma moeda válida com três letras.',
      };
    }

    if (
      !VALID_STATUSES.includes(input.status)
    ) {
      return {
        success: false,
        code: 'INVALID_STATUS',
        message:
          'O status informado é inválido.',
      };
    }

    const taxPercentage = Number(
      input.taxPercentage
    );

    if (
      !Number.isFinite(taxPercentage) ||
      taxPercentage < 0
    ) {
      return {
        success: false,
        code: 'INVALID_TAX',
        message:
          'A porcentagem de imposto é inválida.',
      };
    }

    const normalized =
      validateAndNormalizeItems(input.items);

    if (!normalized.success) {
      return {
        success: false,
        code: 'INVALID_ITEMS',
        message: normalized.message,
      };
    }

    const client = await getOwnedClient({
      clientId: input.clientId,
      ownerId,
    });

    if (!client) {
      return {
        success: false,
        code: 'CLIENT_NOT_FOUND',
        message:
          'O cliente selecionado não foi encontrado.',
      };
    }

    if (input.projectId) {
      const validProject =
        await validateProject({
          projectId: input.projectId,
          clientId: input.clientId,
          ownerId,
        });

      if (!validProject) {
        return {
          success: false,
          code: 'PROJECT_NOT_FOUND',
          message:
            'O projeto não pertence ao cliente selecionado.',
        };
      }
    }

    if (invoiceId) {
      const allowed =
        await invoiceBelongsToOwner({
          invoiceId,
          ownerId,
        });

      if (!allowed) {
        return {
          success: false,
          code: 'INVOICE_NOT_FOUND',
          message:
            'A fatura não foi encontrada.',
        };
      }
    }

    const subtotal = normalized.subtotal;

    const taxAmount = roundCurrency(
      subtotal * (taxPercentage / 100)
    );

    const totalAmount = roundCurrency(
      subtotal + taxAmount
    );

    const serializedItems = JSON.stringify(
      normalized.items.map((item) => ({
        description: item.description,
        link: item.link,

        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,

        source: item.source,
        position: item.position,

        report_entry_ids:
          item.reportEntryIds,
      }))
    );

    /*
     * O CTE executa a atualização da fatura,
     * remoção dos vínculos anteriores, recriação
     * dos itens e novos vínculos atomicamente.
     */
    const result = await sql`
      WITH saved_invoice AS (
        INSERT INTO public.invoices (
          id,

          client_id,
          project_id,

          reference_month,

          invoice_date,
          due_date,

          currency,

          tax_percentage,
          subtotal,
          tax_amount,
          total_amount,

          status,
          notes,

          bill_to_name,
          bill_to_company,
          bill_to_email,
          bill_to_phone,

          bill_to_address_line_1,
          bill_to_address_line_2,
          bill_to_city,
          bill_to_state,
          bill_to_postal_code,
          bill_to_country_code,

          issued_at,
          sent_at,
          paid_at,
          cancelled_at,

          created_at,
          updated_at
        )
        VALUES (
          COALESCE(
            ${invoiceId}::uuid,
            gen_random_uuid()
          ),

          ${input.clientId}::uuid,
          ${input.projectId}::uuid,

          ${input.referenceMonth},

          ${input.invoiceDate}::date,
          ${input.dueDate}::date,

          ${currency},

          ${taxPercentage},
          ${subtotal},
          ${taxAmount},
          ${totalAmount},

          ${input.status},
          ${input.notes?.trim() || null},

          ${client.name},
          ${client.company_name},
          ${client.email},
          ${client.phone},

          ${client.address_line_1},
          ${client.address_line_2},
          ${client.city},
          ${client.state},
          ${client.postal_code},
          ${client.country_code},

          CASE
            WHEN ${input.status} IN (
              'issued',
              'sent',
              'paid',
              'overdue'
            )
            THEN NOW()
            ELSE NULL
          END,

          CASE
            WHEN ${input.status} = 'sent'
            THEN NOW()
            ELSE NULL
          END,

          CASE
            WHEN ${input.status} = 'paid'
            THEN NOW()
            ELSE NULL
          END,

          CASE
            WHEN ${input.status} = 'cancelled'
            THEN NOW()
            ELSE NULL
          END,

          NOW(),
          NOW()
        )

        ON CONFLICT (id)
        DO UPDATE SET
          client_id = EXCLUDED.client_id,
          project_id = EXCLUDED.project_id,

          reference_month =
            EXCLUDED.reference_month,

          invoice_date =
            EXCLUDED.invoice_date,

          due_date = EXCLUDED.due_date,
          currency = EXCLUDED.currency,

          tax_percentage =
            EXCLUDED.tax_percentage,

          subtotal = EXCLUDED.subtotal,
          tax_amount = EXCLUDED.tax_amount,

          total_amount =
            EXCLUDED.total_amount,

          status = EXCLUDED.status,
          notes = EXCLUDED.notes,

          bill_to_name =
            EXCLUDED.bill_to_name,

          bill_to_company =
            EXCLUDED.bill_to_company,

          bill_to_email =
            EXCLUDED.bill_to_email,

          bill_to_phone =
            EXCLUDED.bill_to_phone,

          bill_to_address_line_1 =
            EXCLUDED.bill_to_address_line_1,

          bill_to_address_line_2 =
            EXCLUDED.bill_to_address_line_2,

          bill_to_city =
            EXCLUDED.bill_to_city,

          bill_to_state =
            EXCLUDED.bill_to_state,

          bill_to_postal_code =
            EXCLUDED.bill_to_postal_code,

          bill_to_country_code =
            EXCLUDED.bill_to_country_code,

          issued_at =
            CASE
              WHEN EXCLUDED.status IN (
                'issued',
                'sent',
                'paid',
                'overdue'
              )
              THEN COALESCE(
                invoices.issued_at,
                NOW()
              )
              ELSE invoices.issued_at
            END,

          sent_at =
            CASE
              WHEN EXCLUDED.status = 'sent'
              THEN COALESCE(
                invoices.sent_at,
                NOW()
              )
              ELSE invoices.sent_at
            END,

          paid_at =
            CASE
              WHEN EXCLUDED.status = 'paid'
              THEN COALESCE(
                invoices.paid_at,
                NOW()
              )
              ELSE invoices.paid_at
            END,

          cancelled_at =
            CASE
              WHEN EXCLUDED.status =
                'cancelled'
              THEN COALESCE(
                invoices.cancelled_at,
                NOW()
              )
              ELSE invoices.cancelled_at
            END,

          updated_at = NOW()

        RETURNING
          id,
          invoice_number
      ),

      removed_relations AS (
        DELETE FROM
          public.invoice_report_entries

        WHERE invoice_id = (
          SELECT id
          FROM saved_invoice
        )

        RETURNING id
      ),

      removed_items AS (
        DELETE FROM public.invoice_items

        WHERE invoice_id = (
          SELECT id
          FROM saved_invoice
        )

        RETURNING id
      ),

      source_items AS (
        SELECT
          item.description,
          item.link,

          item.quantity,
          item.rate,
          item.amount,

          item.source,
          item.position,

          item.report_entry_ids

        FROM jsonb_to_recordset(
          ${serializedItems}::jsonb
        ) AS item (
          description TEXT,
          link TEXT,

          quantity NUMERIC,
          rate NUMERIC,
          amount NUMERIC,

          source VARCHAR,
          position INTEGER,

          report_entry_ids JSONB
        )
      ),

      inserted_items AS (
        INSERT INTO public.invoice_items (
          invoice_id,

          description,
          link,

          quantity,
          rate,
          amount,

          source,
          position,

          created_at,
          updated_at
        )
        SELECT
          saved_invoice.id,

          source_item.description,
          source_item.link,

          source_item.quantity,
          source_item.rate,
          source_item.amount,

          source_item.source,
          source_item.position,

          NOW(),
          NOW()

        FROM saved_invoice

        CROSS JOIN source_items source_item

        RETURNING
          id,
          position
      ),

      inserted_relations AS (
        INSERT INTO public.invoice_report_entries (
          invoice_id,
          invoice_item_id,
          report_entry_id,
          created_at
        )
        SELECT
          saved_invoice.id,

          inserted_item.id,

          report_entry_id.value::uuid,

          NOW()

        FROM saved_invoice

        INNER JOIN inserted_items inserted_item
          ON TRUE

        INNER JOIN source_items source_item
          ON source_item.position =
            inserted_item.position

        CROSS JOIN LATERAL
          jsonb_array_elements_text(
            source_item.report_entry_ids
          ) AS report_entry_id(value)

        RETURNING id
      )

      SELECT
        id,
        invoice_number
      FROM saved_invoice
    `;

    const saved = result[0] as
      | {
          id: string;
          invoice_number: string | number;
        }
      | undefined;

    if (!saved) {
      throw new Error(
        'A fatura não foi retornada após o salvamento.'
      );
    }

    revalidatePath('/faturas');
    revalidatePath(`/faturas/${saved.id}`);
    revalidatePath(
      `/faturas/${saved.id}/editar`
    );

    if (input.projectId) {
      revalidatePath(
        `/projetos/${input.projectId}`
      );
    }

    revalidatePath('/relatorios');

    return {
      success: true,
      invoiceId: String(saved.id),
      invoiceNumber: String(
        saved.invoice_number
      ),
    };
  } catch (error) {
    console.error(
      'Erro ao salvar fatura:',
      error
    );

    const databaseError = error as {
      code?: string;
      constraint?: string;
    };

    if (
      databaseError.code === '23505' &&
      databaseError.constraint ===
        'invoice_report_entries_unique_entry'
    ) {
      return {
        success: false,
        code: 'REPORT_ENTRY_ALREADY_INVOICED',
        message:
          'Um ou mais lançamentos selecionados já pertencem a outra fatura.',
      };
    }

    return {
      success: false,
      code: 'INVOICE_SAVE_FAILED',
      message:
        'Não foi possível salvar a fatura.',
    };
  }
}

export async function updateInvoiceStatus({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}): Promise<InvoiceStatusResult> {
  try {
    if (
      !isValidUuid(invoiceId) ||
      !VALID_STATUSES.includes(status)
    ) {
      return {
        success: false,
        message:
          'Os dados informados são inválidos.',
      };
    }

    const ownerId =
      await getCurrentAppUserId();

    const rows = await sql`
      UPDATE public.invoices invoice
      SET
        status = ${status},

        issued_at =
          CASE
            WHEN ${status} IN (
              'issued',
              'sent',
              'paid',
              'overdue'
            )
            THEN COALESCE(
              issued_at,
              NOW()
            )
            ELSE issued_at
          END,

        sent_at =
          CASE
            WHEN ${status} = 'sent'
            THEN COALESCE(
              sent_at,
              NOW()
            )
            ELSE sent_at
          END,

        paid_at =
          CASE
            WHEN ${status} = 'paid'
            THEN COALESCE(
              paid_at,
              NOW()
            )
            ELSE paid_at
          END,

        cancelled_at =
          CASE
            WHEN ${status} = 'cancelled'
            THEN COALESCE(
              cancelled_at,
              NOW()
            )
            ELSE cancelled_at
          END,

        updated_at = NOW()

      FROM public.clients client

      WHERE
        invoice.id = ${invoiceId}::uuid

        AND client.id =
          invoice.client_id

        AND client.owner_id =
          ${ownerId}::uuid

      RETURNING invoice.id
    `;

    if (!rows[0]) {
      return {
        success: false,
        message:
          'A fatura não foi encontrada.',
      };
    }

    revalidatePath('/faturas');
    revalidatePath(`/faturas/${invoiceId}`);

    return {
      success: true,
      message:
        'Status atualizado com sucesso.',
    };
  } catch (error) {
    console.error(
      'Erro ao atualizar status da fatura:',
      error
    );

    return {
      success: false,
      message:
        'Não foi possível atualizar o status.',
    };
  }
}

export async function deleteInvoice(
  invoiceId: string
): Promise<InvoiceStatusResult> {
  try {
    if (!isValidUuid(invoiceId)) {
      return {
        success: false,
        message:
          'O identificador da fatura é inválido.',
      };
    }

    const ownerId =
      await getCurrentAppUserId();

    const rows = await sql`
      DELETE FROM public.invoices invoice

      USING public.clients client

      WHERE
        invoice.id =
          ${invoiceId}::uuid

        AND client.id =
          invoice.client_id

        AND client.owner_id =
          ${ownerId}::uuid

      RETURNING
        invoice.id,
        invoice.project_id
    `;

    const deletedInvoice = rows[0] as
      | {
          id: string;
          project_id: string | null;
        }
      | undefined;

    if (!deletedInvoice) {
      return {
        success: false,
        message:
          'A fatura não foi encontrada.',
      };
    }

    /*
     * invoice_items e invoice_report_entries
     * são removidos pelas regras ON DELETE CASCADE.
     *
     * Com isso, os lançamentos anteriormente
     * vinculados voltam a ficar disponíveis
     * para uma nova fatura.
     */
    revalidatePath('/faturas');
    revalidatePath('/relatorios');

    if (deletedInvoice.project_id) {
      revalidatePath(
        `/projetos/${deletedInvoice.project_id}`
      );
    }

    return {
      success: true,
      message:
        'Fatura excluída com sucesso.',
    };
  } catch (error) {
    console.error(
      'Erro ao excluir fatura:',
      error
    );

    return {
      success: false,
      message:
        'Não foi possível excluir a fatura.',
    };
  }
}