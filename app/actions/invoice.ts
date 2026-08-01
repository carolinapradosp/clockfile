// app/actions/invoice.ts

'use server';

import { sql } from '@/lib/db';

import type {
  InvoiceItemSource,
  SaveInvoiceInput,
  SaveInvoiceResult,
  SavedInvoice,
} from '@/interfaces/Invoice';

type InvoiceRow = {
  id: string;
  invoice_number: number | string;
  reference_month: string;
  invoice_date: string | Date;
  tax_percentage: number | string;
};

type InvoiceItemRow = {
  id: string;
  description: string;
  link: string | null;
  quantity: number | string | null;
  rate: number | string | null;
  amount: number | string | null;
  source: InvoiceItemSource;
};

function isValidMonth(month: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function formatDatabaseDate(
  value: string | Date
): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function normalizeNullableNumber(
  value: number | null
): number | null {
  if (value === null) {
    return null;
  }

  return Number.isFinite(value)
    ? value
    : null;
}

export async function getInvoiceByMonth(
  month: string
): Promise<SavedInvoice | null> {
  if (!isValidMonth(month)) {
    return null;
  }


  const invoiceRows = await sql`
    SELECT
      id,
      invoice_number,
      reference_month,
      invoice_date,
      tax_percentage
    FROM invoices
 WHERE reference_month = ${month}
    LIMIT 1
  `;

  const invoice =
    invoiceRows[0] as InvoiceRow | undefined;

  if (!invoice) {
    return null;
  }

  const itemRows = await sql`
    SELECT
      id,
      description,
      link,
      quantity,
      rate,
      amount,
      source
    FROM invoice_items
    WHERE invoice_id = ${invoice.id}::uuid
    ORDER BY position ASC, created_at ASC
  `;

  const items =
    itemRows as InvoiceItemRow[];

  return {
    id: String(invoice.id),

    invoiceNumber:
      Number(invoice.invoice_number),

    referenceMonth:
      formatDatabaseDate(
        invoice.reference_month
      ).slice(0, 7),

    invoiceDate:
      formatDatabaseDate(
        invoice.invoice_date
      ),

    taxPercentage:
      Number(invoice.tax_percentage),

    items: items.map((item) => ({
      id: String(item.id),
      description: item.description,
      link: item.link,

      quantity:
        item.quantity === null
          ? null
          : Number(item.quantity),

      rate:
        item.rate === null
          ? null
          : Number(item.rate),

      amount:
        item.amount === null
          ? null
          : Number(item.amount),

      source: item.source,
    })),
  };
}

export async function saveInvoice(
  input: SaveInvoiceInput
): Promise<SaveInvoiceResult> {
  try {
    if (
      !isValidMonth(input.referenceMonth)
    ) {
      return {
        success: false,
        message:
          'The reference month is invalid.',
      };
    }

    if (!isValidDate(input.invoiceDate)) {
      return {
        success: false,
        message:
          'The invoice date is invalid.',
      };
    }

    const taxPercentage =
      Number(input.taxPercentage);

    if (
      !Number.isFinite(taxPercentage) ||
      taxPercentage < 0
    ) {
      return {
        success: false,
        message:
          'The tax percentage is invalid.',
      };
    }

    const items = input.items
      .map((item, position) => ({
        description:
          item.description.trim(),

        link:
          item.link?.trim() || null,

        quantity:
          normalizeNullableNumber(
            item.quantity
          ),

        rate:
          normalizeNullableNumber(
            item.rate
          ),

        amount:
          normalizeNullableNumber(
            item.amount
          ),

        source: item.source,
        position,
      }))
      .filter(
        (item) =>
          item.description.length > 0
      );

    if (items.length === 0) {
      return {
        success: false,
        message:
          'Add at least one invoice item.',
      };
    }

    const invalidItem = items.some(
      (item) =>
        item.quantity !== null &&
        item.quantity < 0 ||
        item.rate !== null &&
        item.rate < 0 ||
        item.amount !== null &&
        item.amount < 0
    );

    if (invalidItem) {
      return {
        success: false,
        message:
          'Invoice values cannot be negative.',
      };
    }

  const referenceMonth =
  input.referenceMonth;

    const serializedItems =
      JSON.stringify(items);

    const result = await sql`
      WITH saved_invoice AS (
        INSERT INTO invoices (
          reference_month,
          invoice_date,
          tax_percentage,
          created_at,
          updated_at
        )
        VALUES (
         ${referenceMonth},
          ${input.invoiceDate}::date,
          ${taxPercentage},
          NOW(),
          NOW()
        )
        ON CONFLICT (reference_month)
        DO UPDATE SET
          invoice_date =
            EXCLUDED.invoice_date,

          tax_percentage =
            EXCLUDED.tax_percentage,

          updated_at = NOW()

        RETURNING
          id,
          invoice_number
      ),

      removed_items AS (
        DELETE FROM invoice_items
        WHERE invoice_id = (
          SELECT id
          FROM saved_invoice
        )
        RETURNING id
      ),

      inserted_items AS (
        INSERT INTO invoice_items (
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

          item.description,

          item.link,

          item.quantity,

          item.rate,

          item.amount,

          item.source,

          item.position,

          NOW(),
          NOW()

        FROM saved_invoice

        CROSS JOIN jsonb_to_recordset(
          ${serializedItems}::jsonb
        ) AS item (
          description TEXT,
          link TEXT,
          quantity NUMERIC,
          rate NUMERIC,
          amount NUMERIC,
          source VARCHAR,
          position INTEGER
        )

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
          invoice_number:
            | number
            | string;
        }
      | undefined;

    if (!saved) {
      throw new Error(
        'Invoice was not returned after saving.'
      );
    }

    return {
      success: true,
      invoiceId: String(saved.id),

      invoiceNumber:
        Number(saved.invoice_number),
    };
  } catch (error) {
    console.error(
      'Error saving invoice:',
      error
    );

    return {
      success: false,
      message:
        'The invoice could not be saved.',
    };
  }
}