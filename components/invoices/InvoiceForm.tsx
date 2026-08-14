// components/invoices/InvoiceForm.tsx

'use client';

import Link from 'next/link';

import {
    Download,
    LoaderCircle,
    Save,
} from 'lucide-react';

import {
    useMemo,
    useRef,
    useState,
} from 'react';

import { useRouter } from 'next/navigation';

import {
    getUnbilledReportEntries,
    saveInvoice,
} from '@/app/actions/invoice';

import InvoiceItemsEditor from '@/components/invoices/InvoiceItemsEditor';

import type {
    Invoice,
    InvoiceBillToInput,
    InvoiceItem,
    InvoiceItemSource,
    InvoiceProjectOption,
    InvoiceReportEntryOption,
    InvoiceStatus,
    SaveInvoiceInput,
} from '@/interfaces/Invoice';
import formatCurrency, { formatPhone, inputClassNameNoIcon } from '@/lib/utils';

type EditableInvoiceItemField =
    | 'description'
    | 'link'
    | 'quantity'
    | 'rate'
    | 'amount'
    | 'source';

type InvoiceFormProps = {
    projects: InvoiceProjectOption[];

    invoice?: Invoice;

    initialProjectId?: string;
    initialMonth?: string;
};



const textareaClassName = `
  min-h-28
  w-full
  resize-y
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  py-3
  text-sm
  text-slate-900
  outline-none
  transition-all
  placeholder:text-slate-400
  focus:border-blue-500
  focus:ring-4
  focus:ring-blue-500/10
`;

const COUNTRIES = [
    {
        value: 'BR',
        label: 'Brasil',
    },
    {
        value: 'US',
        label: 'Estados Unidos',
    },
    {
        value: 'EUR',
        label: 'Europa',
    }
] as const;

function isValidPersonName(
    value: string
): boolean {
    const normalized =
        value.trim();

    return (
        normalized.length >= 2 &&
        !/\d/.test(normalized)
    );
}

function isValidEmail(
    value: string
): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        value
    );
}

function getPhoneDigits(
    value: string
): string {
    return value.replace(
        /\D/g,
        ''
    );
}

function isValidPhone(
    value: string
): boolean {
    const digits =
        getPhoneDigits(value);

    /*
     * DDD + telefone:
     * 10 dígitos para fixo
     * 11 dígitos para celular.
     */
    return (
        digits.length === 10 ||
        digits.length === 11
    );
}

const VALID_COUNTRY_CODES =
    new Set(
        COUNTRIES.map(
            (country) =>
                country.value
        )
    );

function createLocalId() {
    return crypto.randomUUID();
}

function createEmptyItem(
    source: Exclude<
        InvoiceItemSource,
        'monthly-report'
    > = 'manual'
): InvoiceItem {
    return {
        id: createLocalId(),

        description: '',
        link: '',

        quantity: '1',
        rate: '',
        amount: '',

        source,

        reportEntryIds: [],
    };
}

function normalizeInitialItems(
    invoice?: Invoice
): InvoiceItem[] {
    if (!invoice?.items.length) {
        return [
            createEmptyItem(),
        ];
    }

    return invoice.items.map(
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
                    : String(
                        item.rate
                    ),

            amount:
                String(item.amount),

            source:
                item.source,

            reportEntryIds:
                item.reportEntryIds,
        })
    );
}

function createInitialBillTo(
    invoice?: Invoice
): InvoiceBillToInput {
    return {
        name:
            invoice?.billTo.name ?? '',

        company:
            invoice?.billTo.company ??
            '',

        email:
            invoice?.billTo.email ?? '',

        phone:
            invoice?.billTo.phone ?? '',

        addressLine1:
            invoice?.billTo
                .addressLine1 ?? '',

        addressLine2:
            invoice?.billTo
                .addressLine2 ?? '',

        city:
            invoice?.billTo.city ?? '',

        state:
            invoice?.billTo.state ?? '',

        postalCode:
            invoice?.billTo
                .postalCode ?? '',

        countryCode:
            invoice?.billTo
                .countryCode ?? '',
    };
}


function createBillToFromProject(
    project?: InvoiceProjectOption
): InvoiceBillToInput {
    return {
        name:
            project?.billing.name ??
            '',

        company:
            project?.billing.company ??
            '',

        email:
            project?.billing.email ??
            '',

        phone:
            project?.billing.phone ??
            '',

        addressLine1:
            project?.billing
                .addressLine1 ??
            '',

        addressLine2:
            project?.billing
                .addressLine2 ??
            '',

        city:
            project?.billing.city ??
            '',

        state:
            project?.billing.state ??
            '',

        postalCode:
            project?.billing
                .postalCode ??
            '',

        countryCode:
            project?.billing
                .countryCode ??
            '',
    };
}

function roundCurrency(
    value: number
) {
    return (
        Math.round(value * 100) /
        100
    );
}

function getDefaultInvoiceDate() {
    return new Date()
        .toISOString()
        .slice(0, 10);
}

function getDefaultDueDate() {
    const date = new Date();

    date.setDate(
        date.getDate() + 15
    );

    return date
        .toISOString()
        .slice(0, 10);
}

function getDefaultMonth() {
    return new Date()
        .toISOString()
        .slice(0, 7);
}

function buildMonthlyReportItem({
    entries,
    project,
    referenceMonth,
}: {
    entries:
    InvoiceReportEntryOption[];

    project:
    InvoiceProjectOption;

    referenceMonth: string;
}): InvoiceItem {
    const totalMinutes =
        entries.reduce(
            (total, entry) =>
                total +
                entry.durationMinutes,
            0
        );

    const quantity =
        roundCurrency(
            totalMinutes / 60
        );

    const rates = entries
        .map(
            (entry) => entry.rate
        )
        .filter(
            (
                rate
            ): rate is number =>
                rate !== null
        );

    const uniqueRates =
        Array.from(
            new Set(rates)
        );

    const rate =
        uniqueRates.length === 1
            ? uniqueRates[0]
            : project.defaultHourlyRate;

    const amount =
        roundCurrency(
            entries.reduce(
                (total, entry) =>
                    total + entry.amount,
                0
            )
        );

    const [
        year,
        month,
    ] = referenceMonth
        .split('-')
        .map(Number);

    const monthLabel =
        new Date(
            Date.UTC(
                year,
                month - 1,
                1
            )
        ).toLocaleDateString(
            'en-US',
            {
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
            }
        );

    return {
        id: createLocalId(),

        description:
            `${project.name} — ${monthLabel}`,

        link: '',

        quantity:
            String(quantity),

        rate:
            rate === null
                ? ''
                : String(rate),

        amount:
            String(amount),

        source:
            'monthly-report',

        reportEntryIds:
            entries.map(
                (entry) => entry.id
            ),
    };
}

function normalizeOptionalValue(
    value: string
): string | null {
    const normalized =
        value.trim();

    return normalized || null;
}

export default function InvoiceForm({
    projects,
    invoice,
    initialProjectId,
    initialMonth,
}: InvoiceFormProps) {

    const initialProject =
        projects.find(
            (project) =>
                project.id ===
                initialProjectId
        );
    const router = useRouter();
    const errorRef =
        useRef<HTMLDivElement>(
            null
        );
    const [
        billTo,
        setBillTo,
    ] = useState<InvoiceBillToInput>(
        invoice
            ? createInitialBillTo(
                invoice
            )
            : createBillToFromProject(
                initialProject
            )
    );

    const [
        projectId,
        setProjectId,
    ] = useState(
        invoice?.projectId ??
        initialProjectId ??
        ''
    );

    const [
        referenceMonth,
        setReferenceMonth,
    ] = useState(
        invoice?.referenceMonth ??
        initialMonth ??
        getDefaultMonth()
    );

    const [
        invoiceDate,
        setInvoiceDate,
    ] = useState(
        invoice?.invoiceDate ??
        getDefaultInvoiceDate()
    );

    const [
        dueDate,
        setDueDate,
    ] = useState(
        invoice?.dueDate ??
        getDefaultDueDate()
    );

    const [
        currency,
        setCurrency,
    ] = useState(
        invoice?.currency ??
        projects.find(
            (project) =>
                project.id ===
                initialProjectId
        )?.currency ??
        'USD'
    );

    const [
        taxPercentage,
        setTaxPercentage,
    ] = useState(
        String(
            invoice
                ?.taxPercentage ?? 0
        )
    );

    const [
        notes,
        setNotes,
    ] = useState(
        invoice?.notes ?? ''
    );

    const [
        items,
        setItems,
    ] = useState<
        InvoiceItem[]
    >(
        normalizeInitialItems(
            invoice
        )
    );

    const [
        isSaving,
        setIsSaving,
    ] = useState(false);

    const [
        isImporting,
        setIsImporting,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState('');

    const [
        successMessage,
        setSuccessMessage,
    ] = useState('');

    const subtotal = useMemo(
        () =>
            roundCurrency(
                items.reduce(
                    (
                        total,
                        item
                    ) => {
                        const amount =
                            Number(
                                item.amount
                            );

                        return (
                            total +
                            (
                                Number.isFinite(
                                    amount
                                )
                                    ? amount
                                    : 0
                            )
                        );
                    },
                    0
                )
            ),
        [items]
    );

    const numericTax =
        Number(
            taxPercentage
        );

    const taxAmount =
        Number.isFinite(
            numericTax
        ) &&
            numericTax >= 0
            ? roundCurrency(
                subtotal *
                (
                    numericTax /
                    100
                )
            )
            : 0;

    const total =
        roundCurrency(
            subtotal +
            taxAmount
        );

    function handleBillToChange(
        field:
            keyof InvoiceBillToInput,

        value: string
    ) {
        let normalizedValue =
            value;

        if (field === 'name') {
            /*
             * Remove números do nome
             * durante a digitação.
             */
            normalizedValue =
                value.replace(
                    /\d/g,
                    ''
                );
        }

        if (
            field === 'countryCode'
        ) {
            normalizedValue =
                value.toUpperCase();
        }

        setBillTo(
            (current) => ({
                ...current,

                [field]:
                    normalizedValue,
            })
        );
    }

    function handleProjectChange(
        value: string
    ) {
        setProjectId(value);

        const project =
            projects.find(
                (item) =>
                    item.id === value
            );

        if (!project) {
            return;
        }

        setCurrency(
            project.currency
        );

        /*
         * Em uma fatura nova,
         * o projeto é a fonte dos
         * dados padrão do destinatário.
         *
         * Em edição, evitamos sobrescrever
         * automaticamente o snapshot
         * salvo na fatura.
         */
        if (!invoice) {
            setBillTo(
                createBillToFromProject(
                    project
                )
            );
        }
    }

    function handleItemChange(
        id: string,

        field:
            EditableInvoiceItemField,

        value: string
    ) {
        setItems(
            (currentItems) =>
                currentItems.map(
                    (item) => {
                        if (
                            item.id !== id
                        ) {
                            return item;
                        }

                        const updatedItem = {
                            ...item,
                            [field]: value,
                        };

                        if (
                            field ===
                            'quantity' ||
                            field === 'rate'
                        ) {
                            const quantity =
                                Number(
                                    updatedItem
                                        .quantity
                                );

                            const rate =
                                Number(
                                    updatedItem.rate
                                );

                            if (
                                Number.isFinite(
                                    quantity
                                ) &&
                                quantity >= 0 &&
                                Number.isFinite(
                                    rate
                                ) &&
                                rate >= 0
                            ) {
                                updatedItem.amount =
                                    String(
                                        roundCurrency(
                                            quantity *
                                            rate
                                        )
                                    );
                            }
                        }

                        return updatedItem;
                    }
                )
        );
    }

    function removeItem(
        id: string
    ) {
        setItems(
            (currentItems) =>
                currentItems.filter(
                    (item) =>
                        item.id !== id
                )
        );
    }

    function addItem(
        source: Exclude<
            InvoiceItemSource,
            'monthly-report'
        >
    ) {
        setItems(
            (currentItems) => [
                ...currentItems,
                createEmptyItem(
                    source
                ),
            ]
        );
    }

    async function importReportEntries() {
        if (!projectId) {
            showError(
                'Selecione um projeto antes de importar as horas.'
            );

            return;
        }

        if (!referenceMonth) {
            showError(
                'Selecione o mês de referência.'
            );

            return;
        }

        const project =
            projects.find(
                (item) =>
                    item.id ===
                    projectId
            );

        if (!project) {
            showError(
                'O projeto selecionado não foi encontrado.'
            );

            return;
        }

        try {
            setIsImporting(true);
            setError('');
            setSuccessMessage('');

            const entries =
                await getUnbilledReportEntries(
                    {
                        projectId,

                        month:
                            referenceMonth,

                        invoiceId:
                            invoice?.id,
                    }
                );

            if (
                entries.length === 0
            ) {
                showError(
                    'Nenhum lançamento disponível para faturamento nesse projeto e mês.'
                );

                return;
            }

            const reportItem =
                buildMonthlyReportItem(
                    {
                        entries,
                        project,
                        referenceMonth,
                    }
                );

            setItems(
                (currentItems) => {
                    const withoutPreviousReport =
                        currentItems.filter(
                            (item) =>
                                item.source !==
                                'monthly-report'
                        );

                    const meaningfulItems =
                        withoutPreviousReport.filter(
                            (item) =>
                                item.description.trim() ||
                                item.amount.trim()
                        );

                    return [
                        reportItem,
                        ...meaningfulItems,
                    ];
                }
            );

            setCurrency(
                project.currency
            );

            setSuccessMessage(
                `${entries.length} lançamento(s) foram importados para a fatura.`
            );
        } catch (
        importError
        ) {
            console.error(
                'Erro ao importar lançamentos:',
                importError
            );

            showError(
                'Não foi possível carregar os lançamentos.'
            );
        } finally {
            setIsImporting(
                false
            );
        }
    }
    function showError(
        message: string
    ) {
        setError(message);
        setSuccessMessage('');

        /*
         * Espera o React concluir a renderização
         * do alerta antes de fazer o scroll.
         */
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                errorRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });

                errorRef.current?.focus({
                    preventScroll: true,
                });
            });
        });
    }


    function buildPayload(
        status: InvoiceStatus
    ): SaveInvoiceInput | null {
        const recipientName =
            billTo.name.trim();

        const recipientEmail =
            billTo.email?.trim() ??
            '';

        const recipientPhone =
            billTo.phone?.trim() ??
            '';

        const countryCode =
            billTo.countryCode
                ?.trim()
                .toUpperCase() ??
            '';

        if (!recipientName) {
            showError(
                'Informe o nome do destinatário.'
            );

            return null;
        }

        if (
            !isValidPersonName(
                recipientName
            )
        ) {
            showError(
                'Informe um nome válido, sem números.'
            );

            return null;
        }

        if (
            recipientEmail &&
            !isValidEmail(
                recipientEmail
            )
        ) {
            showError(
                'Informe um e-mail válido para o destinatário.'
            );

            return null;
        }

        if (
            recipientPhone &&
            !isValidPhone(
                recipientPhone
            )
        ) {
            showError(
                'Informe um telefone válido com DDD.'
            );

            return null;
        }

        if (!countryCode) {
            showError(
                'Selecione o país do destinatário.'
            );

            return null;
        }

        if (
            !VALID_COUNTRY_CODES.has(
                countryCode as typeof COUNTRIES[number]['value']
            )
        ) {
            showError(
                'Selecione um país válido.'
            );

            return null;
        }

        if (!referenceMonth) {
            showError(
                'Informe o mês de referência.'
            );

            return null;
        }

        if (!invoiceDate) {
            showError(
                'Informe a data da fatura.'
            );

            return null;
        }

        // restante do buildPayload continua igual

        const normalizedItems =
            items.map(
                (
                    item,
                    position
                ) => ({
                    description:
                        item.description,

                    link:
                        item.link.trim()
                            ? item.link
                            : null,

                    quantity:
                        item.quantity.trim()
                            ? Number(
                                item.quantity
                            )
                            : null,

                    rate:
                        item.rate.trim()
                            ? Number(
                                item.rate
                            )
                            : null,

                    amount:
                        Number(
                            item.amount
                        ),

                    source:
                        item.source,

                    position,

                    reportEntryIds:
                        item.reportEntryIds,
                })
            );

        return {
            invoiceId:
                invoice?.id,

            projectId:
                projectId || null,

            referenceMonth,

            invoiceDate,

            dueDate:
                dueDate || null,

            currency,

            taxPercentage:
                Number(
                    taxPercentage
                ),

            notes:
                notes.trim() ||
                null,

            status,

            billTo: {
                name:
                    billTo.name.trim(),

                company:
                    normalizeOptionalValue(
                        billTo.company ??
                        ''
                    ),

                email:
                    normalizeOptionalValue(
                        billTo.email ?? ''
                    ),

                phone:
                    normalizeOptionalValue(
                        billTo.phone ?? ''
                    ),

                addressLine1:
                    normalizeOptionalValue(
                        billTo
                            .addressLine1 ??
                        ''
                    ),

                addressLine2:
                    normalizeOptionalValue(
                        billTo
                            .addressLine2 ??
                        ''
                    ),

                city:
                    normalizeOptionalValue(
                        billTo.city ?? ''
                    ),

                state:
                    normalizeOptionalValue(
                        billTo.state ?? ''
                    ),

                postalCode:
                    normalizeOptionalValue(
                        billTo
                            .postalCode ??
                        ''
                    ),

                countryCode:
                    normalizeOptionalValue(
                        billTo
                            .countryCode ??
                        ''
                    ),
            },

            items:
                normalizedItems,
        };
    }

    async function handleSave(
        status: InvoiceStatus
    ) {
        const payload =
            buildPayload(status);

        if (!payload) {
            return;
        }

        try {
            setIsSaving(true);

            setError('');
            setSuccessMessage('');

            const result =
                await saveInvoice(
                    payload
                );

            if (!result.success) {
                showError(
                    result.message
                );

                return;
            }

            router.replace(
                `/faturas/${result.invoiceId}`
            );

            router.refresh();
        } catch (saveError) {
            console.error(
                'Erro ao salvar fatura:',
                saveError
            );

            showError(
                'Não foi possível salvar a fatura.'
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-8">
            {error && (
                <div
                    ref={errorRef}
                    role="alert"
                    tabIndex={-1}
                    className="scroll-mt-24 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 outline-none"
                >
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                    {successMessage}
                </div>
            )}



            {/* INFORMAÇÕES DA FATURA */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">
                        Informações da fatura
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Selecione o projeto, período e moeda da cobrança.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="invoice-project"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Projeto
                        </label>

                        <select
                            id="invoice-project"
                            value={projectId}
                            onChange={(event) =>
                                handleProjectChange(
                                    event.target.value
                                )
                            }
                            className={inputClassNameNoIcon}
                        >
                            <option value="">
                                Sem projeto específico
                            </option>

                            {projects.map(
                                (project) => (
                                    <option
                                        key={
                                            project.id
                                        }
                                        value={
                                            project.id
                                        }
                                    >
                                        {project.name}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="reference-month"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Mês de referência *
                        </label>

                        <input
                            id="reference-month"
                            type="month"
                            value={
                                referenceMonth
                            }
                            onChange={(event) =>
                                setReferenceMonth(
                                    event.target.value
                                )
                            }
                            className={inputClassNameNoIcon}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="currency"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Moeda *
                        </label>

                        <select
                            id="currency"
                            value={currency}
                            onChange={(event) =>
                                setCurrency(
                                    event.target.value
                                )
                            }
                            className={inputClassNameNoIcon}
                        >
                            <option value="BRL">
                                Real brasileiro (BRL)
                            </option>

                            <option value="USD">
                                Dólar americano (USD)
                            </option>

                            <option value="EUR">
                                Euro (EUR)
                            </option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="invoice-date"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Data da fatura *
                        </label>

                        <input
                            id="invoice-date"
                            type="date"
                            value={invoiceDate}
                            onChange={(event) =>
                                setInvoiceDate(
                                    event.target.value
                                )
                            }
                            className={inputClassNameNoIcon}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="due-date"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Vencimento
                        </label>

                        <input
                            id="due-date"
                            type="date"
                            value={dueDate}
                            onChange={(event) =>
                                setDueDate(
                                    event.target.value
                                )
                            }
                            className={inputClassNameNoIcon}
                        />
                    </div>
                </div>

                <div className="mt-5">
                    <button
                        type="button"
                        onClick={
                            importReportEntries
                        }
                        disabled={
                            isImporting ||
                            !projectId ||
                            !referenceMonth
                        }
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isImporting ? (
                            <LoaderCircle
                                size={17}
                                className="animate-spin"
                            />
                        ) : (
                            <Download
                                size={17}
                            />
                        )}

                        {isImporting
                            ? 'Importando...'
                            : 'Importar horas do mês'}
                    </button>
                </div>
            </section>


            {/* DESTINATÁRIO */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">
                        Destinatário
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Informe os dados que serão exibidos na fatura.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="bill-to-name"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Nome *
                        </label>

                        <input
                            id="bill-to-name"
                            maxLength={150}
                            type="text"
                            value={billTo.name}
                            onChange={(event) =>
                                handleBillToChange(
                                    'name',
                                    event.target.value
                                )
                            }
                            placeholder="Nome do destinatário"
                            className={inputClassNameNoIcon}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="bill-to-company"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Empresa
                        </label>

                        <input
                            id="bill-to-company"
                            maxLength={150}
                            type="text"
                            value={
                                billTo.company ??
                                ''
                            }
                            onChange={(event) =>
                                handleBillToChange(
                                    'company',
                                    event.target.value
                                )
                            }
                            placeholder="Nome da empresa"
                            className={inputClassNameNoIcon}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="bill-to-email"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            E-mail
                        </label>

                        <input
                            id="bill-to-email"
                            type="email"
                            maxLength={255}
                            value={
                                billTo.email ?? ''
                            }
                            onChange={(event) =>
                                handleBillToChange(
                                    'email',
                                    event.target.value
                                )
                            }
                            placeholder="cliente@empresa.com"
                            className={inputClassNameNoIcon}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="bill-to-phone"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Telefone
                        </label>

                        <input
                            id="bill-to-phone"
                            type="tel"
                            inputMode="tel"
                            value={
                                formatPhone(
                                    billTo.phone ?? ''
                                )
                            }
                            onChange={(event) =>
                                handleBillToChange(
                                    'phone',
                                    formatPhone(
                                        event.target.value
                                    )
                                )
                            }
                            maxLength={15}
                            placeholder="(11) 99999-9999"
                            className={
                                inputClassNameNoIcon
                            }
                        />

                        <p className="mt-2 text-xs text-slate-400">
                            Informe o DDD e o número do telefone.
                        </p>
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="bill-to-address-line-1"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Endereço
                        </label>

                        <input
                            id="bill-to-address-line-1"
                            maxLength={255}
                            type="text"
                            value={
                                billTo
                                    .addressLine1 ??
                                ''
                            }
                            onChange={(event) =>
                                handleBillToChange(
                                    'addressLine1',
                                    event.target.value
                                )
                            }
                            placeholder="Rua, número e complemento principal"
                            className={inputClassNameNoIcon}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="bill-to-address-line-2"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Complemento
                        </label>

                        <input
                            id="bill-to-address-line-2"
                            maxLength={255}
                            type="text"
                            value={
                                billTo
                                    .addressLine2 ??
                                ''
                            }
                            onChange={(event) =>
                                handleBillToChange(
                                    'addressLine2',
                                    event.target.value
                                )
                            }
                            placeholder="Sala, apartamento ou complemento"
                            className={inputClassNameNoIcon}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="bill-to-city"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Cidade
                        </label>

                        <input
                            id="bill-to-city"
                            maxLength={150}
                            type="text"
                            value={
                                billTo.city ?? ''
                            }
                            onChange={(event) =>
                                handleBillToChange(
                                    'city',
                                    event.target.value
                                )
                            }
                            className={inputClassNameNoIcon}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="bill-to-state"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Estado
                        </label>

                        <input
                            id="bill-to-state"
                            maxLength={100}
                            type="text"
                            value={
                                billTo.state ?? ''
                            }
                            onChange={(event) =>
                                handleBillToChange(
                                    'state',
                                    event.target.value
                                )
                            }
                            className={inputClassNameNoIcon}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="bill-to-postal-code"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            CEP / Código postal
                        </label>

                        <input
                            id="bill-to-postal-code"
                            maxLength={30}
                            type="text"
                            value={
                                billTo
                                    .postalCode ??
                                ''
                            }
                            onChange={(event) =>
                                handleBillToChange(
                                    'postalCode',
                                    event.target.value
                                )
                            }
                            className={inputClassNameNoIcon}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="bill-to-country"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            País
                        </label>

                        <select
                            id="bill-to-country"
                            value={
                                billTo.countryCode ??
                                ''
                            }
                            onChange={(event) =>
                                handleBillToChange(
                                    'countryCode',
                                    event.target.value
                                )
                            }
                            className={
                                inputClassNameNoIcon
                            }
                        >
                            <option value="">
                                Selecione o país
                            </option>

                            {COUNTRIES.map(
                                (country) => (
                                    <option
                                        key={
                                            country.value
                                        }
                                        value={
                                            country.value
                                        }
                                    >
                                        {country.label}
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                </div>
            </section>

            <InvoiceItemsEditor
                items={items}
                onChange={
                    handleItemChange
                }
                onRemove={
                    removeItem
                }
                onAdd={addItem}
            />

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <label
                        htmlFor="invoice-notes"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Observações
                    </label>

                    <textarea
                        id="invoice-notes"
                        value={notes}
                        onChange={(event) =>
                            setNotes(
                                event.target.value
                            )
                        }
                        placeholder="Condições de pagamento, informações bancárias ou observações..."
                        className={
                            textareaClassName
                        }
                    />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                        <label
                            htmlFor="tax-percentage"
                            className="text-sm font-semibold text-slate-700"
                        >
                            Imposto
                        </label>

                        <div className="flex items-center gap-2">
                            <input
                                id="tax-percentage"
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    taxPercentage
                                }
                                onChange={(event) =>
                                    setTaxPercentage(
                                        event.target.value
                                    )
                                }
                                className="h-10 w-24 rounded-xl border border-slate-200 px-3 text-right text-sm outline-none focus:border-blue-500"
                            />

                            <span className="text-sm text-slate-500">
                                %
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
                        <div className="flex justify-between gap-4 text-slate-500">
                            <span>
                                Subtotal
                            </span>

                            <span className="font-semibold text-slate-800">
                                {formatCurrency({
                                    value:
                                        subtotal,

                                    currency,
                                })}
                            </span>
                        </div>

                        <div className="flex justify-between gap-4 text-slate-500">
                            <span>
                                Imposto
                            </span>

                            <span className="font-semibold text-slate-800">
                                {formatCurrency({
                                    value:
                                        taxAmount,

                                    currency,
                                })}
                            </span>
                        </div>

                        <div className="flex justify-between gap-4 border-t border-slate-100 pt-4">
                            <span className="font-bold text-slate-900">
                                Total
                            </span>

                            <span className="text-xl font-bold text-slate-900">
                                {formatCurrency({
                                    value:
                                        total,

                                    currency,
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <Link
                    href={
                        invoice
                            ? `/faturas/${invoice.id}`
                            : '/faturas'
                    }
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                    Cancelar
                </Link>

                <button
                    type="button"
                    onClick={() =>
                        handleSave(
                            'draft'
                        )
                    }
                    disabled={isSaving}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
                >
                    <Save size={18} />

                    {isSaving
                        ? 'Salvando...'
                        : 'Salvar rascunho'}
                </button>

                <button
                    type="button"
                    onClick={() =>
                        handleSave(
                            'issued'
                        )
                    }
                    disabled={isSaving}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
                >
                    <Save size={18} />

                    {isSaving
                        ? 'Salvando...'
                        : invoice
                            ? 'Salvar e emitir'
                            : 'Criar e emitir'}
                </button>
            </div>
        </div>
    );
}