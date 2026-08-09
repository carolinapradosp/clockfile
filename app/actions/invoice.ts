// app/actions/invoice.ts

'use server';

import { revalidatePath } from 'next/cache';

import { sql } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth/current-user';

import type {
  Invoice,
  InvoiceBillToInput,
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
import { isValidCurrency, isValidMonth } from '@/lib/utils';

type InvoiceRow = {
  id: string;
  owner_id: string;

  invoice_number:
    | string
    | number;

  project_id: string | null;
  project_name: string | null;

  reference_month: string;

  invoice_date:
    | string
    | Date;

  due_date:
    | string
    | Date
    | null;

  currency: string;

  tax_percentage:
    | string
    | number;

  subtotal:
    | string
    | number;

  tax_amount:
    | string
    | number;

  total_amount:
    | string
    | number;

  status: InvoiceStatus;
  notes: string | null;

  bill_to_name: string | null;
  bill_to_company: string | null;
  bill_to_email: string | null;
  bill_to_phone: string | null;

  bill_to_address_line_1:
    | string
    | null;

  bill_to_address_line_2:
    | string
    | null;

  bill_to_city: string | null;
  bill_to_state: string | null;

  bill_to_postal_code:
    | string
    | null;

  bill_to_country_code:
    | string
    | null;

  issued_at:
    | string
    | Date
    | null;

  sent_at:
    | string
    | Date
    | null;

  paid_at:
    | string
    | Date
    | null;

  cancelled_at:
    | string
    | Date
    | null;

  created_at:
    | string
    | Date;

  updated_at:
    | string
    | Date;
};

type InvoiceItemRow = {
  id: string;

  description: string;
  link: string | null;

  quantity:
    | string
    | number
    | null;

  rate:
    | string
    | number
    | null;

  amount:
    | string
    | number;

  source: InvoiceItemSource;

  position:
    | string
    | number;

  report_entry_ids:
    | string[]
    | null;
};

type InvoiceProjectOptionRow = {
  id: string;
  owner_id: string;

  name: string;

  default_hourly_rate:
    | string
    | number
    | null;

  currency: string;

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
};

type InvoiceReportEntryRow = {
  id: string;
  project_id: string;

  task: string;
  description: string;

  date:
    | string
    | Date;

  duration: string | null;

  duration_minutes:
    | string
    | number
    | null;

  rate:
    | string
    | number
    | null;

  amount:
    | string
    | number
    | null;

  currency: string | null;
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

function isValidUuid(
  value: string
): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
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

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return false;
  }

  return (
    date
      .toISOString()
      .slice(0, 10) === value
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

  return String(value).slice(
    0,
    10
  );
}

function normalizeDateTime(
  value:
    | string
    | Date
    | null
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

  const match =
    /^(\d+):([0-5]\d)$/.exec(
      duration
    );

  if (!match) {
    return 0;
  }

  return (
    Number(match[1]) * 60 +
    Number(match[2])
  );
}

function minutesToDuration(
  totalMinutes: number
): string {
  const safeMinutes =
    Number.isSafeInteger(
      totalMinutes
    ) &&
    totalMinutes >= 0
      ? totalMinutes
      : 0;

  const hours = Math.floor(
    safeMinutes / 60
  );

  const minutes =
    safeMinutes % 60;

  return `${String(hours).padStart(
    2,
    '0'
  )}:${String(minutes).padStart(
    2,
    '0'
  )}`;
}

function roundCurrency(
  value: number
): number {
  return (
    Math.round(value * 100) /
    100
  );
}

function normalizeOptionalText(
  value:
    | string
    | null
    | undefined
): string | null {
  if (!value) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized || null;
}

function normalizeBillTo(
  billTo: InvoiceBillToInput
): InvoiceBillToInput {
  return {
    name: billTo.name.trim(),

    company:
      normalizeOptionalText(
        billTo.company
      ),

    email:
      normalizeOptionalText(
        billTo.email
      )?.toLowerCase() ?? null,

    phone:
      normalizeOptionalText(
        billTo.phone
      ),

    addressLine1:
      normalizeOptionalText(
        billTo.addressLine1
      ),

    addressLine2:
      normalizeOptionalText(
        billTo.addressLine2
      ),

    city:
      normalizeOptionalText(
        billTo.city
      ),

    state:
      normalizeOptionalText(
        billTo.state
      ),

    postalCode:
      normalizeOptionalText(
        billTo.postalCode
      ),

    countryCode:
      normalizeOptionalText(
        billTo.countryCode
      )?.toUpperCase() ?? null,
  };
}

function validateBillTo(
  billTo: InvoiceBillToInput
):
  | {
      success: true;
      billTo: InvoiceBillToInput;
    }
  | {
      success: false;
      message: string;
    } {
  const normalized =
    normalizeBillTo(billTo);

  if (!normalized.name) {
    return {
      success: false,
      message:
        'Informe o nome do destinatário da fatura.',
    };
  }

  if (
    normalized.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      normalized.email
    )
  ) {
    return {
      success: false,
      message:
        'Informe um e-mail válido para o destinatário.',
    };
  }

  if (
    normalized.countryCode &&
    !/^[A-Z]{2}$/.test(
      normalized.countryCode
    )
  ) {
    return {
      success: false,
      message:
        'O código do país deve possuir duas letras.',
    };
  }

  return {
    success: true,
    billTo: normalized,
  };
}

function mapInvoiceRow(
  row: InvoiceRow
): InvoiceSummary {
  return {
    id: String(row.id),

    ownerId:
      String(row.owner_id),

    invoiceNumber:
      String(
        row.invoice_number
      ),

    projectId:
      row.project_id
        ? String(
            row.project_id
          )
        : null,

    projectName:
      row.project_name,

    referenceMonth:
      row.reference_month,

    invoiceDate:
      normalizeDate(
        row.invoice_date
      ) ?? '',

    dueDate:
      normalizeDate(
        row.due_date
      ),

    currency:
      row.currency,

    taxPercentage:
      Number(
        row.tax_percentage
      ),

    subtotal:
      Number(
        row.subtotal
      ),

    taxAmount:
      Number(
        row.tax_amount
      ),

    totalAmount:
      Number(
        row.total_amount
      ),

    status:
      row.status,

    notes:
      row.notes,

    billTo: {
      name:
        row.bill_to_name,

      company:
        row.bill_to_company,

      email:
        row.bill_to_email,

      phone:
        row.bill_to_phone,

      addressLine1:
        row.bill_to_address_line_1,

      addressLine2:
        row.bill_to_address_line_2,

      city:
        row.bill_to_city,

      state:
        row.bill_to_state,

      postalCode:
        row.bill_to_postal_code,

      countryCode:
        row.bill_to_country_code,
    },

    issuedAt:
      normalizeDateTime(
        row.issued_at
      ),

    sentAt:
      normalizeDateTime(
        row.sent_at
      ),

    paidAt:
      normalizeDateTime(
        row.paid_at
      ),

    cancelledAt:
      normalizeDateTime(
        row.cancelled_at
      ),

    createdAt:
      normalizeDateTime(
        row.created_at
      ) ?? '',

    updatedAt:
      normalizeDateTime(
        row.updated_at
      ) ?? '',
  };
}

function mapInvoiceItem(
  row: InvoiceItemRow
): SavedInvoiceItem {
  return {
    id: String(row.id),

    description:
      row.description,

    link:
      row.link,

    quantity:
      row.quantity === null
        ? null
        : Number(
            row.quantity
          ),

    rate:
      row.rate === null
        ? null
        : Number(
            row.rate
          ),

    amount:
      Number(
        row.amount
      ),

    source:
      row.source,

    position:
      Number(
        row.position
      ),

    reportEntryIds:
      row.report_entry_ids
        ?.map(String) ?? [],
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
  const normalizedItems =
    items
      .map(
        (
          item,
          index
        ) => {
          const quantity =
            item.quantity === null
              ? null
              : Number(
                  item.quantity
                );

          const rate =
            item.rate === null
              ? null
              : Number(
                  item.rate
                );

          let amount =
            Number(
              item.amount
            );

          if (
            (
              !Number.isFinite(
                amount
              ) ||
              amount < 0
            ) &&
            quantity !== null &&
            rate !== null
          ) {
            amount =
              roundCurrency(
                quantity *
                  rate
              );
          }

          return {
            description:
              item.description.trim(),

            link:
              item.link
                ?.trim() ||
              null,

            quantity,
            rate,
            amount,

            source:
              item.source,

            position:
              Number.isSafeInteger(
                item.position
              ) &&
              item.position >= 0
                ? item.position
                : index,

            reportEntryIds:
              Array.from(
                new Set(
                  item.reportEntryIds.filter(
                    isValidUuid
                  )
                )
              ),
          };
        }
      )
      .filter(
        (item) =>
          item.description
      );

  if (
    normalizedItems.length ===
    0
  ) {
    return {
      success: false,
      message:
        'Adicione pelo menos um item à fatura.',
    };
  }

  for (
    const item of
    normalizedItems
  ) {
    if (
      !VALID_ITEM_SOURCES.includes(
        item.source
      )
    ) {
      return {
        success: false,
        message:
          'Um dos itens possui uma origem inválida.',
      };
    }

    if (
      item.quantity !== null &&
      (
        !Number.isFinite(
          item.quantity
        ) ||
        item.quantity < 0
      )
    ) {
      return {
        success: false,
        message:
          'A quantidade de um dos itens é inválida.',
      };
    }

    if (
      item.rate !== null &&
      (
        !Number.isFinite(
          item.rate
        ) ||
        item.rate < 0
      )
    ) {
      return {
        success: false,
        message:
          'O rate de um dos itens é inválido.',
      };
    }

    if (
      !Number.isFinite(
        item.amount
      ) ||
      item.amount < 0
    ) {
      return {
        success: false,
        message:
          'O valor de um dos itens é inválido.',
      };
    }

    if (
      item.source ===
        'monthly-report' &&
      item.reportEntryIds
        .length === 0
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

    items:
      normalizedItems,

    subtotal:
      roundCurrency(
        normalizedItems.reduce(
          (
            total,
            item
          ) =>
            total +
            item.amount,
          0
        )
      ),
  };
}

async function validateProject({
  projectId,
  ownerId,
}: {
  projectId: string;
  ownerId: string;
}): Promise<boolean> {
  const rows = await sql`
    SELECT id

    FROM public.projects

    WHERE
      id =
        ${projectId}::uuid

      AND owner_id =
        ${ownerId}::uuid

      AND status <>
        'archived'

    LIMIT 1
  `;

  return Boolean(
    rows[0]
  );
}

async function invoiceBelongsToOwner({
  invoiceId,
  ownerId,
}: {
  invoiceId: string;
  ownerId: string;
}): Promise<boolean> {
  const rows = await sql`
    SELECT id

    FROM public.invoices

    WHERE
      id =
        ${invoiceId}::uuid

      AND owner_id =
        ${ownerId}::uuid

    LIMIT 1
  `;

  return Boolean(
    rows[0]
  );
}

async function validateReportEntryRelations({
  items,
  ownerId,
  projectId,
  invoiceId,
}: {
  items: InvoiceItemInput[];
  ownerId: string;
  projectId: string | null;
  invoiceId: string | null;
}): Promise<boolean> {
  const reportEntryIds =
    Array.from(
      new Set(
        items.flatMap(
          (item) =>
            item.reportEntryIds
        )
      )
    );

  if (
    reportEntryIds.length ===
    0
  ) {
    return true;
  }

  if (!projectId) {
    return false;
  }

  const serializedIds =
    JSON.stringify(
      reportEntryIds
    );

  const rows = await sql`
    SELECT
      COUNT(DISTINCT entry.id)
        AS valid_count

    FROM public.report_entries
      entry

    INNER JOIN public.projects
      project
      ON project.id =
        entry.project_id

    LEFT JOIN
      public.invoice_report_entries
      relation
      ON relation.report_entry_id =
        entry.id

    WHERE
      entry.id IN (
        SELECT
          value::uuid

        FROM
          jsonb_array_elements_text(
            ${serializedIds}::jsonb
          )
      )

      AND entry.project_id =
        ${projectId}::uuid

      AND project.owner_id =
        ${ownerId}::uuid

      AND (
        relation.report_entry_id
          IS NULL

        OR relation.invoice_id =
          ${invoiceId ?? null}::uuid
      )
  `;

  const validCount =
    Number(
      rows[0]
        ?.valid_count ?? 0
    );

  return (
    validCount ===
    reportEntryIds.length
  );
}

export async function getInvoiceProjectOptions(): Promise<
  InvoiceProjectOption[]
> {
  const ownerId =
    await getCurrentUserId();

  const rows = await sql`
    SELECT
      id,
      owner_id,
      name,

      default_hourly_rate,
      currency,

      billing_name,
      billing_company,
      billing_email,
      billing_phone,

      billing_address_line_1,
      billing_address_line_2,

      billing_city,
      billing_state,

      billing_postal_code,
      billing_country_code

    FROM public.projects

    WHERE
      owner_id =
        ${ownerId}::uuid

      AND status <>
        'archived'

    ORDER BY name ASC
  `;

  return (
    rows as
      InvoiceProjectOptionRow[]
  ).map(
    (row) => ({
      id:
        String(row.id),

      ownerId:
        String(
          row.owner_id
        ),

      name:
        row.name,

      defaultHourlyRate:
        row.default_hourly_rate ===
        null
          ? null
          : Number(
              row.default_hourly_rate
            ),

      currency:
        row.currency,

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
    })
  );
}

export async function getUnbilledReportEntries({
  projectId,
  month,
  invoiceId,
}: {
  projectId: string;
  month: string;
  invoiceId?: string;
}): Promise<
  InvoiceReportEntryOption[]
> {
  if (
    !isValidUuid(
      projectId
    ) ||
    !isValidMonth(
      month
    )
  ) {
    return [];
  }

  if (
    invoiceId &&
    !isValidUuid(
      invoiceId
    )
  ) {
    return [];
  }

  const ownerId =
    await getCurrentUserId();

  const startDate =
    `${month}-01`;

  const [
    year,
    monthNumber,
  ] = month
    .split('-')
    .map(Number);

  const endDate =
    new Date(
      Date.UTC(
        year,
        monthNumber,
        0
      )
    )
      .toISOString()
      .slice(0, 10);

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

    FROM public.report_entries
      entry

    INNER JOIN public.projects
      project
      ON project.id =
        entry.project_id

    LEFT JOIN
      public.invoice_report_entries
      relation
      ON relation.report_entry_id =
        entry.id

    WHERE
      entry.project_id =
        ${projectId}::uuid

      AND project.owner_id =
        ${ownerId}::uuid

      AND entry.date >=
        ${startDate}::date

      AND entry.date < (
        ${endDate}::date
        + INTERVAL '1 day'
      )

      AND (
        relation.report_entry_id
          IS NULL

        OR relation.invoice_id =
          ${invoiceId ?? null}::uuid
      )

    ORDER BY
      entry.date ASC,
      entry.created_at ASC
  `;

  return (
    rows as
      InvoiceReportEntryRow[]
  ).map(
    (row) => {
      const storedMinutes =
        Number(
          row.duration_minutes
        );

      const durationMinutes =
        Number.isSafeInteger(
          storedMinutes
        ) &&
        storedMinutes >= 0
          ? storedMinutes
          : durationToMinutes(
              row.duration
            );

      return {
        id:
          String(row.id),

        projectId:
          String(
            row.project_id
          ),

        task:
          row.task,

        description:
          row.description,

        date:
          normalizeDate(
            row.date
          ) ?? '',

        duration:
          row.duration ||
          minutesToDuration(
            durationMinutes
          ),

        durationMinutes,

        rate:
          row.rate === null
            ? null
            : Number(
                row.rate
              ),

        amount:
          row.amount === null
            ? 0
            : Number(
                row.amount
              ),

        currency:
          row.currency ??
          'USD',
      };
    }
  );
}

export async function getInvoices(
  filters: InvoiceFilters = {}
): Promise<
  InvoiceSummary[]
> {
  const ownerId =
    await getCurrentUserId();

  const {
    projectId,
    status,
    month,
  } = filters;

  if (
    projectId &&
    !isValidUuid(
      projectId
    )
  ) {
    return [];
  }

  if (
    status &&
    !VALID_STATUSES.includes(
      status
    )
  ) {
    return [];
  }

  if (
    month &&
    !isValidMonth(
      month
    )
  ) {
    return [];
  }

  const rows = await sql`
    SELECT
      invoice.id,
      invoice.owner_id,
      invoice.invoice_number,

      invoice.project_id,

      project.name
        AS project_name,

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

    FROM public.invoices
      invoice

    LEFT JOIN public.projects
      project
      ON project.id =
        invoice.project_id

    WHERE
      invoice.owner_id =
        ${ownerId}::uuid

      AND (
        ${projectId ?? null}::uuid
          IS NULL

        OR invoice.project_id =
          ${projectId ?? null}::uuid
      )

      AND (
        ${status ?? null}::text
          IS NULL

        OR invoice.status =
          ${status ?? null}::text
      )

      AND (
        ${month ?? null}::text
          IS NULL

        OR invoice.reference_month =
          ${month ?? null}::text
      )

    ORDER BY
      invoice.invoice_date DESC,
      invoice.created_at DESC
  `;

  return (
    rows as InvoiceRow[]
  ).map(
    mapInvoiceRow
  );
}

export async function getInvoiceById(
  invoiceId: string
): Promise<
  Invoice | null
> {
  if (
    !isValidUuid(
      invoiceId
    )
  ) {
    return null;
  }

  const ownerId =
    await getCurrentUserId();

  const rows = await sql`
    SELECT
      invoice.id,
      invoice.owner_id,
      invoice.invoice_number,

      invoice.project_id,

      project.name
        AS project_name,

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

    FROM public.invoices
      invoice

    LEFT JOIN public.projects
      project
      ON project.id =
        invoice.project_id

    WHERE
      invoice.id =
        ${invoiceId}::uuid

      AND invoice.owner_id =
        ${ownerId}::uuid

    LIMIT 1
  `;

  const row =
    rows[0] as
      | InvoiceRow
      | undefined;

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

          ORDER BY
            relation.created_at ASC
        ) FILTER (
          WHERE
            relation.report_entry_id
              IS NOT NULL
        ),

        ARRAY[]::text[]
      ) AS report_entry_ids

    FROM public.invoice_items
      item

    LEFT JOIN
      public.invoice_report_entries
      relation
      ON relation.invoice_item_id =
        item.id

    WHERE
      item.invoice_id =
        ${invoiceId}::uuid

    GROUP BY
      item.id

    ORDER BY
      item.position ASC,
      item.created_at ASC
  `;

  return {
    ...mapInvoiceRow(
      row
    ),

    items: (
      itemRows as
        InvoiceItemRow[]
    ).map(
      mapInvoiceItem
    ),
  };
}

export async function saveInvoice(
  input: SaveInvoiceInput
): Promise<
  SaveInvoiceResult
> {
  try {
    const ownerId =
      await getCurrentUserId();

    const invoiceId =
      input.invoiceId
        ?.trim() || null;

    if (
      invoiceId &&
      !isValidUuid(
        invoiceId
      )
    ) {
      return {
        success: false,

        code:
          'INVALID_INVOICE_ID',

        message:
          'O identificador da fatura é inválido.',
      };
    }

    if (
      input.projectId &&
      !isValidUuid(
        input.projectId
      )
    ) {
      return {
        success: false,

        code:
          'INVALID_PROJECT',

        message:
          'Selecione um projeto válido.',
      };
    }

    if (
      !isValidMonth(
        input.referenceMonth
      )
    ) {
      return {
        success: false,

        code:
          'INVALID_REFERENCE_MONTH',

        message:
          'O mês de referência é inválido.',
      };
    }

    if (
      !isValidDate(
        input.invoiceDate
      )
    ) {
      return {
        success: false,

        code:
          'INVALID_INVOICE_DATE',

        message:
          'A data da fatura é inválida.',
      };
    }

    if (
      input.dueDate &&
      !isValidDate(
        input.dueDate
      )
    ) {
      return {
        success: false,

        code:
          'INVALID_DUE_DATE',

        message:
          'A data de vencimento é inválida.',
      };
    }

    if (
      input.dueDate &&
      input.dueDate <
        input.invoiceDate
    ) {
      return {
        success: false,

        code:
          'DUE_DATE_BEFORE_INVOICE',

        message:
          'O vencimento não pode ser anterior à data da fatura.',
      };
    }

    const currency =
      input.currency
        .trim()
        .toUpperCase();

    if (
      !isValidCurrency(
        currency
      )
    ) {
      return {
        success: false,

        code:
          'INVALID_CURRENCY',

        message:
          'Informe uma moeda válida com três letras.',
      };
    }

    if (
      !VALID_STATUSES.includes(
        input.status
      )
    ) {
      return {
        success: false,

        code:
          'INVALID_STATUS',

        message:
          'O status informado é inválido.',
      };
    }

    const taxPercentage =
      Number(
        input.taxPercentage
      );

    if (
      !Number.isFinite(
        taxPercentage
      ) ||
      taxPercentage < 0
    ) {
      return {
        success: false,

        code:
          'INVALID_TAX',

        message:
          'A porcentagem de imposto é inválida.',
      };
    }

    const validatedBillTo =
      validateBillTo(
        input.billTo
      );

    if (
      !validatedBillTo.success
    ) {
      return {
        success: false,

        code:
          'INVALID_BILL_TO',

        message:
          validatedBillTo.message,
      };
    }

    const billTo =
      validatedBillTo.billTo;

    const normalized =
      validateAndNormalizeItems(
        input.items
      );

    if (
      !normalized.success
    ) {
      return {
        success: false,

        code:
          'INVALID_ITEMS',

        message:
          normalized.message,
      };
    }

    /*
     * Valida se o projeto pertence
     * ao usuário autenticado.
     */
    if (
      input.projectId
    ) {
      const validProject =
        await validateProject({
          projectId:
            input.projectId,

          ownerId,
        });

      if (
        !validProject
      ) {
        return {
          success: false,

          code:
            'PROJECT_NOT_FOUND',

          message:
            'O projeto selecionado não foi encontrado.',
        };
      }
    }

    /*
     * Em uma edição, garante que
     * a fatura pertence ao usuário.
     */
    if (invoiceId) {
      const allowed =
        await invoiceBelongsToOwner({
          invoiceId,
          ownerId,
        });

      if (!allowed) {
        return {
          success: false,

          code:
            'INVOICE_NOT_FOUND',

          message:
            'A fatura não foi encontrada.',
        };
      }
    }

    /*
     * Valida os lançamentos.
     *
     * Um lançamento sem vínculo pode
     * ser utilizado.
     *
     * Durante uma edição, um lançamento
     * já vinculado à própria fatura
     * também é considerado válido.
     */
    const validRelations =
      await validateReportEntryRelations({
        items:
          normalized.items,

        ownerId,

        projectId:
          input.projectId,

        invoiceId,
      });

    if (
      !validRelations
    ) {
      return {
        success: false,

        code:
          'INVALID_REPORT_ENTRIES',

        message:
          'Um ou mais lançamentos selecionados são inválidos, pertencem a outro projeto ou já foram faturados.',
      };
    }

    const subtotal =
      normalized.subtotal;

    const taxAmount =
      roundCurrency(
        subtotal *
          (
            taxPercentage /
            100
          )
      );

    const totalAmount =
      roundCurrency(
        subtotal +
          taxAmount
      );

    /*
     * Serializamos os itens uma única vez
     * para utilizar jsonb_to_recordset
     * dentro da query.
     */
    const serializedItems =
      JSON.stringify(
        normalized.items.map(
          (item) => ({
            description:
              item.description,

            link:
              item.link,

            quantity:
              item.quantity,

            rate:
              item.rate,

            amount:
              item.amount,

            source:
              item.source,

            position:
              item.position,

            report_entry_ids:
              item.reportEntryIds,
          })
        )
      );

    const result = await sql`
      WITH

      /*
       * Cria ou atualiza a própria
       * fatura.
       */
      saved_invoice AS (
        INSERT INTO
          public.invoices (
            id,

            owner_id,
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

          ${ownerId}::uuid,

          ${
            input.projectId ??
            null
          }::uuid,

          ${
            input.referenceMonth
          },

          ${
            input.invoiceDate
          }::date,

          ${
            input.dueDate ??
            null
          }::date,

          ${currency},

          ${taxPercentage},
          ${subtotal},
          ${taxAmount},
          ${totalAmount},

          ${input.status},

          ${
            input.notes
              ?.trim() ||
            null
          },

          ${billTo.name},
          ${billTo.company},
          ${billTo.email},
          ${billTo.phone},

          ${
            billTo.addressLine1
          },

          ${
            billTo.addressLine2
          },

          ${billTo.city},
          ${billTo.state},

          ${
            billTo.postalCode
          },

          ${
            billTo.countryCode
          },

          CASE
            WHEN ${
              input.status
            } IN (
              'issued',
              'sent',
              'paid',
              'overdue'
            )
            THEN NOW()
            ELSE NULL
          END,

          CASE
            WHEN ${
              input.status
            } = 'sent'
            THEN NOW()
            ELSE NULL
          END,

          CASE
            WHEN ${
              input.status
            } = 'paid'
            THEN NOW()
            ELSE NULL
          END,

          CASE
            WHEN ${
              input.status
            } = 'cancelled'
            THEN NOW()
            ELSE NULL
          END,

          NOW(),
          NOW()
        )

        ON CONFLICT (id)

        DO UPDATE SET
          owner_id =
            EXCLUDED.owner_id,

          project_id =
            EXCLUDED.project_id,

          reference_month =
            EXCLUDED.reference_month,

          invoice_date =
            EXCLUDED.invoice_date,

          due_date =
            EXCLUDED.due_date,

          currency =
            EXCLUDED.currency,

          tax_percentage =
            EXCLUDED.tax_percentage,

          subtotal =
            EXCLUDED.subtotal,

          tax_amount =
            EXCLUDED.tax_amount,

          total_amount =
            EXCLUDED.total_amount,

          status =
            EXCLUDED.status,

          notes =
            EXCLUDED.notes,

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
              WHEN EXCLUDED.status
                IN (
                  'issued',
                  'sent',
                  'paid',
                  'overdue'
                )
              THEN COALESCE(
                invoices.issued_at,
                NOW()
              )

              ELSE
                invoices.issued_at
            END,

          sent_at =
            CASE
              WHEN
                EXCLUDED.status =
                'sent'
              THEN COALESCE(
                invoices.sent_at,
                NOW()
              )

              ELSE
                invoices.sent_at
            END,

          paid_at =
            CASE
              WHEN
                EXCLUDED.status =
                'paid'
              THEN COALESCE(
                invoices.paid_at,
                NOW()
              )

              ELSE
                invoices.paid_at
            END,

          cancelled_at =
            CASE
              WHEN
                EXCLUDED.status =
                'cancelled'
              THEN COALESCE(
                invoices.cancelled_at,
                NOW()
              )

              ELSE
                invoices.cancelled_at
            END,

          updated_at =
            NOW()

        RETURNING
          id,
          invoice_number
      ),

      /*
       * Itens recebidos do formulário.
       */
      source_items AS MATERIALIZED (
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

      /*
       * Lançamentos que devem continuar
       * associados à fatura após o save.
       */
      selected_report_entries
        AS MATERIALIZED (
        SELECT DISTINCT
          report_entry_id.value::uuid
            AS report_entry_id

        FROM source_items
          source_item

        CROSS JOIN LATERAL
          jsonb_array_elements_text(
            source_item.report_entry_ids
          ) AS report_entry_id(
            value
          )
      ),

      /*
       * Remove somente as relações de
       * lançamentos que o usuário retirou
       * da fatura.
       *
       * Relações que continuam selecionadas
       * NÃO são apagadas.
       */
      removed_unused_relations AS (
        DELETE FROM
          public.invoice_report_entries
            relation

        WHERE
          relation.invoice_id = (
            SELECT id
            FROM saved_invoice
          )

          AND NOT EXISTS (
            SELECT 1

            FROM selected_report_entries
              selected

            WHERE
              selected.report_entry_id =
                relation.report_entry_id
          )

        RETURNING
          relation.id
      ),

      /*
       * Captura quais itens pertenciam
       * anteriormente à fatura.
       *
       * MATERIALIZED é importante para que
       * tenhamos esse snapshot antes dos
       * novos itens serem inseridos.
       */
      old_items AS MATERIALIZED (
        SELECT
          item.id

        FROM public.invoice_items
          item

        WHERE
          item.invoice_id = (
            SELECT id
            FROM saved_invoice
          )
      ),

      /*
       * Remove os itens antigos.
       *
       * A FK de
       * invoice_report_entries.invoice_item_id
       * possui ON DELETE SET NULL.
       *
       * Portanto os vínculos dos lançamentos
       * existentes continuam vivos e apenas
       * ficam temporariamente sem item.
       */
      removed_items AS (
        DELETE FROM
          public.invoice_items
            item

        WHERE
          item.id IN (
            SELECT id
            FROM old_items
          )

        RETURNING
          item.id
      ),

      /*
       * Insere a nova versão dos itens.
       */
      inserted_items AS (
        INSERT INTO
          public.invoice_items (
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

        CROSS JOIN
          source_items
            source_item

        /*
         * Cria uma dependência explícita
         * com removed_items.
         *
         * Mesmo quando não há itens antigos,
         * aggregate sempre produz uma linha.
         */
        CROSS JOIN LATERAL (
          SELECT
            COUNT(*) AS
              removed_count

          FROM removed_items
        ) removal_gate

        RETURNING
          id,
          position
      ),

      /*
       * Cria os vínculos para lançamentos
       * novos e atualiza os vínculos que já
       * pertenciam à própria fatura.
       *
       * A constraint UNIQUE(report_entry_id)
       * deixa de ser um problema porque
       * ON CONFLICT transforma a reinserção
       * em UPDATE.
       */
      upserted_relations AS (
        INSERT INTO
          public.invoice_report_entries (
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

        INNER JOIN
          inserted_items
            inserted_item
          ON TRUE

        INNER JOIN
          source_items
            source_item
          ON
            source_item.position =
            inserted_item.position

        CROSS JOIN LATERAL
          jsonb_array_elements_text(
            source_item.report_entry_ids
          ) AS report_entry_id(
            value
          )

        ON CONFLICT (
          report_entry_id
        )

        DO UPDATE SET
          invoice_item_id =
            EXCLUDED.invoice_item_id

        /*
         * Segurança adicional:
         *
         * o conflito somente pode atualizar
         * uma relação que já pertença à
         * própria fatura que está sendo salva.
         *
         * Relação de outra fatura não será
         * apropriada por esta operação.
         */
        WHERE
          invoice_report_entries.invoice_id =
            EXCLUDED.invoice_id

        RETURNING
          id,
          report_entry_id
      ),

      /*
       * Apenas cria uma dependência final
       * para garantir que todos os efeitos
       * anteriores façam parte da operação.
       */
      completed_save AS (
        SELECT
          (
            SELECT COUNT(*)
            FROM
              removed_unused_relations
          ) AS removed_relations,

          (
            SELECT COUNT(*)
            FROM upserted_relations
          ) AS saved_relations
      )

      SELECT
        saved_invoice.id,
        saved_invoice.invoice_number

      FROM saved_invoice

      CROSS JOIN completed_save
    `;

    const saved =
      result[0] as
        | {
            id: string;

            invoice_number:
              | string
              | number;
          }
        | undefined;

    if (!saved) {
      throw new Error(
        'A fatura não foi retornada após o salvamento.'
      );
    }

    revalidatePath(
      '/dashboard'
    );

    revalidatePath(
      '/faturas'
    );

    revalidatePath(
      `/faturas/${saved.id}`
    );

    revalidatePath(
      `/faturas/${saved.id}/editar`
    );

    if (
      input.projectId
    ) {
      revalidatePath(
        `/projetos/${input.projectId}`
      );
    }

    revalidatePath(
      '/relatorios'
    );

    return {
      success: true,

      invoiceId:
        String(saved.id),

      invoiceNumber:
        String(
          saved.invoice_number
        ),
    };
  } catch (error) {
    console.error(
      'Erro ao salvar fatura:',
      error
    );

    const databaseError =
      error as {
        code?: string;
        constraint?: string;
      };

    /*
     * Proteção principal contra
     * faturamento duplicado.
     */
    if (
      databaseError.code ===
        '23505' &&
      databaseError.constraint ===
        'invoice_report_entries_unique_entry'
    ) {
      return {
        success: false,

        code:
          'REPORT_ENTRY_ALREADY_INVOICED',

        message:
          'Um ou mais lançamentos selecionados já pertencem a outra fatura.',
      };
    }

    /*
     * Mantém compatibilidade caso o
     * banco retorne a constraint composta.
     */
    if (
      databaseError.code ===
        '23505' &&
      databaseError.constraint ===
        'invoice_report_entries_unique_relation'
    ) {
      return {
        success: false,

        code:
          'REPORT_ENTRY_ALREADY_INVOICED',

        message:
          'Um ou mais lançamentos selecionados já pertencem a outra fatura.',
      };
    }

    if (
      databaseError.code ===
        '23505' &&
      databaseError.constraint ===
        'invoices_owner_reference_month_unique'
    ) {
      return {
        success: false,

        code:
          'INVOICE_MONTH_ALREADY_EXISTS',

        message:
          'Já existe uma fatura cadastrada para esse mês.',
      };
    }

    return {
      success: false,

      code:
        'INVOICE_SAVE_FAILED',

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
}): Promise<
  InvoiceStatusResult
> {
  try {
    if (
      !isValidUuid(
        invoiceId
      ) ||
      !VALID_STATUSES.includes(
        status
      )
    ) {
      return {
        success: false,

        message:
          'Os dados informados são inválidos.',
      };
    }

    const ownerId =
      await getCurrentUserId();

    const rows = await sql`
      UPDATE public.invoices

      SET
        status =
          ${status},

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
            WHEN ${status} =
              'sent'
            THEN COALESCE(
              sent_at,
              NOW()
            )
            ELSE sent_at
          END,

        paid_at =
          CASE
            WHEN ${status} =
              'paid'
            THEN COALESCE(
              paid_at,
              NOW()
            )
            ELSE paid_at
          END,

        cancelled_at =
          CASE
            WHEN ${status} =
              'cancelled'
            THEN COALESCE(
              cancelled_at,
              NOW()
            )
            ELSE cancelled_at
          END,

        updated_at =
          NOW()

      WHERE
        id =
          ${invoiceId}::uuid

        AND owner_id =
          ${ownerId}::uuid

      RETURNING id
    `;

    if (!rows[0]) {
      return {
        success: false,

        message:
          'A fatura não foi encontrada.',
      };
    }

    revalidatePath(
      '/dashboard'
    );

    revalidatePath(
      '/faturas'
    );

    revalidatePath(
      `/faturas/${invoiceId}`
    );

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
): Promise<
  InvoiceStatusResult
> {
  try {
    if (
      !isValidUuid(
        invoiceId
      )
    ) {
      return {
        success: false,

        message:
          'O identificador da fatura é inválido.',
      };
    }

    const ownerId =
      await getCurrentUserId();

    const rows = await sql`
      DELETE FROM
        public.invoices

      WHERE
        id =
          ${invoiceId}::uuid

        AND owner_id =
          ${ownerId}::uuid

      RETURNING
        id,
        project_id
    `;

    const deletedInvoice =
      rows[0] as
        | {
            id: string;

            project_id:
              | string
              | null;
          }
        | undefined;

    if (
      !deletedInvoice
    ) {
      return {
        success: false,

        message:
          'A fatura não foi encontrada.',
      };
    }

    revalidatePath(
      '/dashboard'
    );

    revalidatePath(
      '/faturas'
    );

    revalidatePath(
      '/relatorios'
    );

    if (
      deletedInvoice.project_id
    ) {
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