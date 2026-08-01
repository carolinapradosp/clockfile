// app/relatorio/invoice-generator/page.tsx

import {
    getInvoiceByMonth,
} from '@/app/actions/invoice';

import {
    getReportEntries,
} from '@/app/actions/report';

import InvoiceBuilder from '@/components/invoices/InvoiceBuilder';

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

function formatInvoiceDate(
    selectedMonth: string
): string {
    const [year, month] =
        selectedMonth.split('-').map(Number);

    const finalDay = new Date(
        Date.UTC(year, month, 0)
    );

    return finalDay
        .toISOString()
        .slice(0, 10);
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

function createSuggestedItems({
    selectedMonth,
    totalMinutes,
    totalAmount,
}: {
    selectedMonth: string;
    totalMinutes: number;
    totalAmount: number;
}): InvoiceItem[] {
    if (
        totalMinutes <= 0 &&
        totalAmount <= 0
    ) {
        return [];
    }

    const totalHours =
        totalMinutes / 60;

    const suggestedRate =
        totalHours > 0
            ? totalAmount / totalHours
            : 0;

    return [
        {
            id: crypto.randomUUID(),

            description:
                `WordPress development — ${formatMonthLabel(
                    selectedMonth
                )}`,

            link:
                'www.studiotwentyseven.com',

            quantity:
                totalHours > 0
                    ? totalHours.toFixed(2)
                    : '',

            rate:
                suggestedRate > 0
                    ? suggestedRate.toFixed(2)
                    : '',

            amount:
                totalAmount > 0
                    ? totalAmount.toFixed(2)
                    : '',

            source:
                'monthly-report',
        },
    ];
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

    const savedInvoice =
        await getInvoiceByMonth(
            selectedMonth
        );

    let initialData:
        InvoiceInitialData;

    if (savedInvoice) {
        initialData = {
            invoiceId:
                savedInvoice.id,

            invoiceNumber:
                String(
                    savedInvoice.invoiceNumber
                ),

            referenceMonth:
                savedInvoice.referenceMonth,

            date:
                savedInvoice.invoiceDate,

            taxPercentage:
                savedInvoice.taxPercentage,

            billTo: {
                name: 'Andrew Sherman',
                company: 'STUDIO 27 LLC',
                address:
                    '370 NE 80TH TERRACE',
                suite: 'SUITE 108',
                cityStateZip:
                    'MIAMI FL 33138',
            },

            items:
                savedInvoice.items.map(
                    (item) => ({
                        id: item.id,

                        description:
                            item.description,

                        link:
                            item.link ?? '',

                        quantity:
                            item.quantity === null
                                ? ''
                                : String(
                                    item.quantity
                                ),

                        rate:
                            item.rate === null
                                ? ''
                                : String(item.rate),

                        amount:
                            item.amount === null
                                ? ''
                                : String(
                                    item.amount
                                ),

                        source: item.source,
                    })
                ),
        };
    } else {
        const reportEntries =
            await getReportEntries(
                selectedMonth
            );

        const totalMinutes =
            reportEntries.reduce(
                (total, entry) =>
                    total +
                    parseDurationToMinutes(
                        String(
                            entry.duration ?? ''
                        )
                    ),
                0
            );

        const totalAmount =
            reportEntries.reduce(
                (total, entry) =>
                    total +
                    Number(
                        entry.amount ?? 0
                    ),
                0
            );

        initialData = {
            invoiceNumber: 'Draft',

            referenceMonth:
                selectedMonth,

            date:
                formatInvoiceDate(
                    selectedMonth
                ),

            billTo: {
                name: 'Andrew Sherman',
                company: 'STUDIO 27 LLC',
                address:
                    '370 NE 80TH TERRACE',
                suite: 'SUITE 108',
                cityStateZip:
                    'MIAMI FL 33138',
            },

            taxPercentage: 0,

            items: createSuggestedItems({
                selectedMonth,
                totalMinutes,
                totalAmount,
            }),
        };
    }

    return (
        <InvoiceBuilder
            initialData={initialData}
        />
    );
}