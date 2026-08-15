// app/actions/dashboard.ts

'use server';

import { sql } from '@/lib/db';

import { getCurrentUserId } from '@/lib/auth/current-user';

import type {
    DashboardCurrencyTotal,
    DashboardData,
    DashboardRecentActivity,
    DashboardRecentInvoice,
    DashboardRecentReportEntry,
} from '@/interfaces/Dashboard';

type ActiveProjectsRow = {
    active_projects: number | string;
};

type MonthlyReportSummaryRow = {
    total_entries: number | string;

    total_minutes: number | string | null;
};

type CurrencyTotalRow = {
    currency: string | null;

    total_amount: number | string | null;
};

type OpenInvoicesCountRow = {
    open_invoices: number | string;
};

type RecentActivityRow = {
    activity_type: 'report-entry' | 'invoice';

    id: string;

    project_id: string | null;
    project_name: string | null;

    title: string;
    description: string | null;

    activity_date: string | Date;

    duration_minutes: number | string | null;

    amount: number | string | null;

    currency: string | null;

    invoice_number: string | null;
    recipient_name: string | null;

    invoice_status: 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'cancelled' | null;

    created_at: string | Date;
};

function normalizeDate(value: string | Date): string {
    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }

    return String(value).slice(0, 10);
}

function normalizeDateTime(value: string | Date): string {
    if (value instanceof Date) {
        return value.toISOString();
    }

    return new Date(value).toISOString();
}

function mapCurrencyTotals(rows: CurrencyTotalRow[]): DashboardCurrencyTotal[] {
    return rows.map((row) => ({
        currency: row.currency ?? 'USD',

        amount: Number(row.total_amount ?? 0),
    }));
}

function mapRecentActivity(row: RecentActivityRow): DashboardRecentActivity {
    if (row.activity_type === 'report-entry') {
        const activity: DashboardRecentReportEntry = {
            type: 'report-entry',

            id: String(row.id),

            projectId: String(row.project_id),

            projectName: row.project_name ?? 'Projeto não informado',

            title: row.title,

            description: row.description ?? '',

            date: normalizeDate(row.activity_date),

            durationMinutes: Number(row.duration_minutes ?? 0),

            amount: Number(row.amount ?? 0),

            currency: row.currency ?? 'USD',

            createdAt: normalizeDateTime(row.created_at),
        };

        return activity;
    }

    const activity: DashboardRecentInvoice = {
        type: 'invoice',

        id: String(row.id),

        projectId: row.project_id ? String(row.project_id) : null,

        projectName: row.project_name,

        invoiceNumber: row.invoice_number ?? '',

        recipientName: row.recipient_name,

        status: row.invoice_status ?? 'draft',

        totalAmount: Number(row.amount ?? 0),

        currency: row.currency ?? 'USD',

        date: normalizeDate(row.activity_date),

        createdAt: normalizeDateTime(row.created_at),
    };

    return activity;
}

export async function getDashboardData(): Promise<DashboardData> {
    const ownerId = await getCurrentUserId();

    const [
        activeProjectsRows,
        monthlyReportRows,
        monthlyGeneratedAmountRows,
        openInvoicesCountRows,
        openInvoiceTotalRows,
        recentActivityRows,
    ] = await Promise.all([
        sql`
      SELECT
        COUNT(*) AS active_projects

      FROM public.projects

      WHERE
        owner_id =
          ${ownerId}::uuid

        AND status = 'active'
    `,

        sql`
      SELECT
        COUNT(*) AS total_entries,

        COALESCE(
          SUM(
            COALESCE(
              entry.duration_minutes,

              (
                split_part(
                  entry.duration,
                  ':',
                  1
                )::INTEGER * 60
              )
              +
              split_part(
                entry.duration,
                ':',
                2
              )::INTEGER
            )
          ),
          0
        ) AS total_minutes

      FROM public.report_entries
        AS entry

      INNER JOIN public.projects
        AS project
        ON project.id =
          entry.project_id

      WHERE
        project.owner_id =
          ${ownerId}::uuid

        AND entry.date >=
          date_trunc(
            'month',
            CURRENT_DATE
          )

        AND entry.date <
          date_trunc(
            'month',
            CURRENT_DATE
          )
          + INTERVAL '1 month'
    `,

        sql`
      SELECT
        COALESCE(
          entry.currency,
          project.currency,
          'USD'
        ) AS currency,

        COALESCE(
          SUM(entry.amount),
          0
        ) AS total_amount

      FROM public.report_entries
        AS entry

      INNER JOIN public.projects
        AS project
        ON project.id =
          entry.project_id

      WHERE
        project.owner_id =
          ${ownerId}::uuid

        AND entry.date >=
          date_trunc(
            'month',
            CURRENT_DATE
          )

        AND entry.date <
          date_trunc(
            'month',
            CURRENT_DATE
          )
          + INTERVAL '1 month'

      GROUP BY
        COALESCE(
          entry.currency,
          project.currency,
          'USD'
        )

      ORDER BY currency ASC
    `,

        sql`
      SELECT
        COUNT(*) AS open_invoices

      FROM public.invoices

      WHERE
        owner_id =
          ${ownerId}::uuid

        AND status IN (
          'issued',
          'sent',
          'overdue'
        )
    `,

        sql`
      SELECT
        currency,

        COALESCE(
          SUM(total_amount),
          0
        ) AS total_amount

      FROM public.invoices

      WHERE
        owner_id =
          ${ownerId}::uuid

        AND status IN (
          'issued',
          'sent',
          'overdue'
        )

      GROUP BY currency

      ORDER BY currency ASC
    `,

        sql`
      SELECT *
      FROM (
        SELECT
          'report-entry'::text
            AS activity_type,

          entry.id,

          entry.project_id,

          project.name
            AS project_name,

          entry.task
            AS title,

          entry.description,

          entry.date
            AS activity_date,

          COALESCE(
            entry.duration_minutes,

            (
              split_part(
                entry.duration,
                ':',
                1
              )::INTEGER * 60
            )
            +
            split_part(
              entry.duration,
              ':',
              2
            )::INTEGER
          ) AS duration_minutes,

          COALESCE(
            entry.amount,
            0
          ) AS amount,

          COALESCE(
            entry.currency,
            project.currency,
            'USD'
          ) AS currency,

          NULL::text
            AS invoice_number,

          NULL::text
            AS recipient_name,

          NULL::text
            AS invoice_status,

          entry.created_at

        FROM public.report_entries
          AS entry

        INNER JOIN public.projects
          AS project
          ON project.id =
            entry.project_id

        WHERE
          project.owner_id =
            ${ownerId}::uuid

        UNION ALL

        SELECT
          'invoice'::text
            AS activity_type,

          invoice.id,

          invoice.project_id,

          project.name
            AS project_name,

          (
            'Fatura #' ||
            invoice.invoice_number
          )::text
            AS title,

          invoice.notes
            AS description,

          invoice.invoice_date
            AS activity_date,

          NULL::INTEGER
            AS duration_minutes,

          invoice.total_amount
            AS amount,

          invoice.currency,

          invoice.invoice_number,

          COALESCE(
            invoice.bill_to_company,
            invoice.bill_to_name
          ) AS recipient_name,

          invoice.status
            AS invoice_status,

          invoice.created_at

        FROM public.invoices
          AS invoice

        LEFT JOIN public.projects
          AS project
          ON project.id =
            invoice.project_id

        WHERE
          invoice.owner_id =
            ${ownerId}::uuid
      ) AS recent_activity

      ORDER BY
        created_at DESC

      LIMIT 8
    `,
    ]);

    const activeProjects = activeProjectsRows[0] as ActiveProjectsRow | undefined;

    const monthlyReport = monthlyReportRows[0] as MonthlyReportSummaryRow | undefined;

    const openInvoices = openInvoicesCountRows[0] as OpenInvoicesCountRow | undefined;

    return {
        activeProjects: Number(activeProjects?.active_projects ?? 0),

        currentMonth: {
            totalEntries: Number(monthlyReport?.total_entries ?? 0),

            totalMinutes: Number(monthlyReport?.total_minutes ?? 0),

            generatedAmounts: mapCurrencyTotals(monthlyGeneratedAmountRows as CurrencyTotalRow[]),
        },

        openInvoices: {
            count: Number(openInvoices?.open_invoices ?? 0),

            totals: mapCurrencyTotals(openInvoiceTotalRows as CurrencyTotalRow[]),
        },

        recentActivity: (recentActivityRows as RecentActivityRow[]).map(mapRecentActivity),
    };
}
