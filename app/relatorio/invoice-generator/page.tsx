// app/relatorio/invoice-generator/page.tsx

import { getReportEntries } from '@/app/actions/report';
import InvoiceBuilder from '@/components/InvoiceBuilder';

import type {
    InvoiceInitialData,
    InvoiceItem,
} from '@/interfaces/Invoice';

type PageProps = {
    searchParams: Promise<{
        month?: string;
    }>;
};

function parseDurationToMinutes(
    duration: string
): number {
    const [hours, minutes] =
        duration.split(':').map(Number);

    if (
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes)
    ) {
        return 0;
    }

    return hours * 60 + minutes;
}

function formatDecimalHours(
    totalMinutes: number
): string {
    const hours = totalMinutes / 60;

    return hours.toFixed(2);
}

function formatInvoiceDate(
    selectedMonth: string
): string {
    const [year, month] =
        selectedMonth.split('-').map(Number);

    const finalDay = new Date(
        Date.UTC(year, month, 0)
    );

    return finalDay.toLocaleDateString(
        'en-US',
        {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
        }
    );
}

function formatMonthLabel(
    selectedMonth: string
): string {
    const [year, month] =
        selectedMonth.split('-').map(Number);

    return new Date(
        Date.UTC(year, month - 1, 1)
    ).toLocaleDateString(
        'en-US',
        {
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        }
    );
}

export default async function InvoiceGeneratorPage({
    searchParams,
}: PageProps) {
    const params = await searchParams;

    const selectedMonth =
        params.month ||
        new Date()
            .toISOString()
            .slice(0, 7);

    const reportEntries =
        await getReportEntries(selectedMonth);

    const totalMinutes =
        reportEntries.reduce(
            (total, entry) =>
                total +
                parseDurationToMinutes(
                    String(entry.duration ?? '')
                ),
            0
        );

    const totalAmount =
        reportEntries.reduce(
            (total, entry) =>
                total +
                Number(entry.amount ?? 0),
            0
        );

    const totalHours =
        totalMinutes / 60;

    const suggestedRate =
        totalHours > 0
            ? totalAmount / totalHours
            : 0;

    const monthLabel =
        formatMonthLabel(selectedMonth);

    const initialItems: InvoiceItem[] = [];

    /*
     * Só cria a sugestão automática quando
     * o mês contém horas ou algum valor registrado.
     */
    if (
        totalMinutes > 0 ||
        totalAmount > 0
    ) {
        initialItems.push({
            id: crypto.randomUUID(),

            description:
                `WordPress development — ${monthLabel}`,

            link:
                'www.studiotwentyseven.com',

            quantity:
                totalMinutes > 0
                    ? formatDecimalHours(totalMinutes)
                    : '',

            rate:
                suggestedRate > 0
                    ? suggestedRate.toFixed(2)
                    : '',

            amount:
                totalAmount.toFixed(2),

            source: 'monthly-report',
        });
    }

    const initialData: InvoiceInitialData = {
        /*
         * Número temporário.
         * Depois pode vir de uma tabela de invoices.
         */
        invoiceNumber:
            selectedMonth.replace('-', ''),

        referenceMonth:
            selectedMonth,

        date:
            formatInvoiceDate(selectedMonth),

        billTo: {
            name: 'Andrew Sherman',
            company: 'STUDIO 27 LLC',
            address: '370 NE 80TH TERRACE',
            suite: 'SUITE 108',
            cityStateZip:
                'MIAMI FL 33138',
        },

        taxPercentage: 0,

        items: initialItems,
    };

    return (
        <InvoiceBuilder
            initialData={initialData}
        />
    );
}