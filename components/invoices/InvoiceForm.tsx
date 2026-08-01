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
    InvoiceClientOption,
    InvoiceItem,
    InvoiceItemSource,
    InvoiceProjectOption,
    InvoiceReportEntryOption,
    InvoiceStatus,
    SaveInvoiceInput,
} from '@/interfaces/Invoice';

type EditableInvoiceItemField =
    | 'description'
    | 'link'
    | 'quantity'
    | 'rate'
    | 'amount'
    | 'source';

type InvoiceFormProps = {
    clients: InvoiceClientOption[];
    projects: InvoiceProjectOption[];

    invoice?: Invoice;

    initialClientId?: string;
    initialProjectId?: string;
    initialMonth?: string;
};

const inputClassName = `
  h-12
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  text-sm
  text-slate-900
  outline-none
  transition-all
  placeholder:text-slate-400
  focus:border-blue-500
  focus:ring-4
  focus:ring-blue-500/10
`;

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
        return [createEmptyItem()];
    }

    return invoice.items.map((item) => ({
        id: item.id,
        description: item.description,
        link: item.link ?? '',

        quantity:
            item.quantity === null
                ? ''
                : String(item.quantity),

        rate:
            item.rate === null
                ? ''
                : String(item.rate),

        amount: String(item.amount),

        source: item.source,

        reportEntryIds:
            item.reportEntryIds,
    }));
}

function roundCurrency(
    value: number
) {
    return Math.round(value * 100) / 100;
}

function formatCurrency({
    value,
    currency,
}: {
    value: number;
    currency: string;
}) {
    try {
        return new Intl.NumberFormat(
            'en-US',
            {
                style: 'currency',
                currency,
            }
        ).format(value);
    } catch {
        return `${currency} ${value.toFixed(
            2
        )}`;
    }
}

function getDefaultInvoiceDate() {
    return new Date()
        .toISOString()
        .slice(0, 10);
}

function getDefaultDueDate() {
    const date = new Date();

    date.setDate(date.getDate() + 15);

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
    entries: InvoiceReportEntryOption[];
    project: InvoiceProjectOption;
    referenceMonth: string;
}): InvoiceItem {
    const totalMinutes = entries.reduce(
        (total, entry) =>
            total + entry.durationMinutes,
        0
    );

    const quantity = roundCurrency(
        totalMinutes / 60
    );

    const rates = entries
        .map((entry) => entry.rate)
        .filter(
            (rate): rate is number =>
                rate !== null
        );

    const uniqueRates =
        Array.from(new Set(rates));

    const rate =
        uniqueRates.length === 1
            ? uniqueRates[0]
            : project.defaultHourlyRate;

    const amount = roundCurrency(
        entries.reduce(
            (total, entry) =>
                total + entry.amount,
            0
        )
    );

    const [year, month] =
        referenceMonth
            .split('-')
            .map(Number);

    const monthLabel = new Date(
        Date.UTC(year, month - 1, 1)
    ).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });

    return {
        id: createLocalId(),

        description:
            `${project.name} — ${monthLabel}`,

        link: '',

        quantity: String(quantity),

        rate:
            rate === null
                ? ''
                : String(rate),

        amount: String(amount),

        source: 'monthly-report',

        reportEntryIds:
            entries.map((entry) => entry.id),
    };
}

export default function InvoiceForm({
    clients,
    projects,
    invoice,
    initialClientId,
    initialProjectId,
    initialMonth,
}: InvoiceFormProps) {
    const router = useRouter();

    const [clientId, setClientId] =
        useState(
            invoice?.clientId ??
            initialClientId ??
            ''
        );

    const [projectId, setProjectId] =
        useState(
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

    const [dueDate, setDueDate] =
        useState(
            invoice?.dueDate ??
            getDefaultDueDate()
        );

    const [currency, setCurrency] =
        useState(
            invoice?.currency ?? 'USD'
        );

    const [
        taxPercentage,
        setTaxPercentage,
    ] = useState(
        String(
            invoice?.taxPercentage ?? 0
        )
    );

    const [notes, setNotes] =
        useState(invoice?.notes ?? '');

    const [items, setItems] =
        useState<InvoiceItem[]>(
            normalizeInitialItems(invoice)
        );

    const [isSaving, setIsSaving] =
        useState(false);

    const [
        isImporting,
        setIsImporting,
    ] = useState(false);

    const [error, setError] =
        useState('');

    const [successMessage, setSuccessMessage] =
        useState('');

    const filteredProjects =
        useMemo(
            () =>
                clientId
                    ? projects.filter(
                        (project) =>
                            project.clientId ===
                            clientId
                    )
                    : [],
            [clientId, projects]
        );

    const selectedProject =
        projects.find(
            (project) =>
                project.id === projectId
        );

    const subtotal = useMemo(
        () =>
            roundCurrency(
                items.reduce(
                    (total, item) => {
                        const amount =
                            Number(item.amount);

                        return (
                            total +
                            (Number.isFinite(amount)
                                ? amount
                                : 0)
                        );
                    },
                    0
                )
            ),
        [items]
    );

    const numericTax =
        Number(taxPercentage);

    const taxAmount =
        Number.isFinite(numericTax) &&
            numericTax >= 0
            ? roundCurrency(
                subtotal *
                (numericTax / 100)
            )
            : 0;

    const total =
        roundCurrency(
            subtotal + taxAmount
        );

    function handleClientChange(
        value: string
    ) {
        setClientId(value);
        setProjectId('');
    }

    function handleProjectChange(
        value: string
    ) {
        setProjectId(value);

        const project = projects.find(
            (item) => item.id === value
        );

        if (project) {
            setCurrency(project.currency);
        }
    }

    function handleItemChange(
        id: string,
        field: EditableInvoiceItemField,
        value: string
    ) {
        setItems((currentItems) =>
            currentItems.map((item) => {
                if (item.id !== id) {
                    return item;
                }

                const updatedItem = {
                    ...item,
                    [field]: value,
                };

                /*
                 * Quando quantidade ou rate mudarem,
                 * recalculamos o amount automaticamente.
                 *
                 * O usuário ainda pode alterar o amount
                 * diretamente depois.
                 */
                if (
                    field === 'quantity' ||
                    field === 'rate'
                ) {
                    const quantity = Number(
                        updatedItem.quantity
                    );

                    const rate = Number(
                        updatedItem.rate
                    );

                    if (
                        Number.isFinite(quantity) &&
                        quantity >= 0 &&
                        Number.isFinite(rate) &&
                        rate >= 0
                    ) {
                        updatedItem.amount =
                            String(
                                roundCurrency(
                                    quantity * rate
                                )
                            );
                    }
                }

                return updatedItem;
            })
        );
    }

    function removeItem(id: string) {
        setItems((currentItems) =>
            currentItems.filter(
                (item) => item.id !== id
            )
        );
    }

    function addItem(
        source: Exclude<
            InvoiceItemSource,
            'monthly-report'
        >
    ) {
        setItems((currentItems) => [
            ...currentItems,
            createEmptyItem(source),
        ]);
    }

    async function importReportEntries() {
        if (!projectId) {
            setError(
                'Selecione um projeto antes de importar as horas.'
            );

            return;
        }

        if (!referenceMonth) {
            setError(
                'Selecione o mês de referência.'
            );

            return;
        }

        const project = projects.find(
            (item) => item.id === projectId
        );

        if (!project) {
            setError(
                'O projeto selecionado não foi encontrado.'
            );

            return;
        }

        try {
            setIsImporting(true);
            setError('');
            setSuccessMessage('');

            const entries =
                await getUnbilledReportEntries({
                    projectId,
                    month: referenceMonth,
                    invoiceId: invoice?.id,
                });

            if (entries.length === 0) {
                setError(
                    'Nenhum lançamento disponível para faturamento nesse projeto e mês.'
                );

                return;
            }

            const reportItem =
                buildMonthlyReportItem({
                    entries,
                    project,
                    referenceMonth,
                });

            setItems((currentItems) => {
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
            });

            setCurrency(project.currency);

            setSuccessMessage(
                `${entries.length} lançamentos foram importados para a fatura.`
            );
        } catch (importError) {
            console.error(
                'Erro ao importar lançamentos:',
                importError
            );

            setError(
                'Não foi possível carregar os lançamentos.'
            );
        } finally {
            setIsImporting(false);
        }
    }

    function buildPayload(
        status: InvoiceStatus
    ): SaveInvoiceInput | null {
        if (!clientId) {
            setError(
                'Selecione um cliente.'
            );

            return null;
        }

        if (!referenceMonth) {
            setError(
                'Informe o mês de referência.'
            );

            return null;
        }

        if (!invoiceDate) {
            setError(
                'Informe a data da fatura.'
            );

            return null;
        }

        const normalizedItems =
            items.map(
                (item, position) => ({
                    description:
                        item.description,

                    link:
                        item.link.trim()
                            ? item.link
                            : null,

                    quantity:
                        item.quantity.trim()
                            ? Number(item.quantity)
                            : null,

                    rate:
                        item.rate.trim()
                            ? Number(item.rate)
                            : null,

                    amount:
                        Number(item.amount),

                    source: item.source,
                    position,

                    reportEntryIds:
                        item.reportEntryIds,
                })
            );

        return {
            invoiceId: invoice?.id,

            clientId,

            projectId:
                projectId || null,

            referenceMonth,

            invoiceDate,

            dueDate:
                dueDate || null,

            currency,

            taxPercentage:
                Number(taxPercentage),

            notes:
                notes.trim() || null,

            status,

            items: normalizedItems,
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
                await saveInvoice(payload);

            if (!result.success) {
                setError(result.message);
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

            setError(
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
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                >
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                    {successMessage}
                </div>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">
                        Informações da fatura
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Selecione o cliente, projeto e período da cobrança.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="invoice-client"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Cliente *
                        </label>

                        <select
                            id="invoice-client"
                            value={clientId}
                            onChange={(event) =>
                                handleClientChange(
                                    event.target.value
                                )
                            }
                            className={inputClassName}
                        >
                            <option value="">
                                Selecione um cliente
                            </option>

                            {clients.map((client) => (
                                <option
                                    key={client.id}
                                    value={client.id}
                                >
                                    {client.companyName
                                        ? `${client.companyName} — ${client.name}`
                                        : client.name}
                                </option>
                            ))}
                        </select>
                    </div>

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
                            disabled={!clientId}
                            className={inputClassName}
                        >
                            <option value="">
                                Sem projeto específico
                            </option>

                            {filteredProjects.map(
                                (project) => (
                                    <option
                                        key={project.id}
                                        value={project.id}
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
                            value={referenceMonth}
                            onChange={(event) =>
                                setReferenceMonth(
                                    event.target.value
                                )
                            }
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="currency"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Moeda *
                        </label>

                        <input
                            id="currency"
                            type="text"
                            maxLength={3}
                            value={currency}
                            onChange={(event) =>
                                setCurrency(
                                    event.target.value
                                        .toUpperCase()
                                )
                            }
                            className={`${inputClassName} uppercase`}
                        />
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
                            className={inputClassName}
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
                            className={inputClassName}
                        />
                    </div>
                </div>

                <div className="mt-5">
                    <button
                        type="button"
                        onClick={importReportEntries}
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
                            <Download size={17} />
                        )}

                        {isImporting
                            ? 'Importando...'
                            : 'Importar horas do mês'}
                    </button>
                </div>
            </section>

            <InvoiceItemsEditor
                items={items}
                onChange={handleItemChange}
                onRemove={removeItem}
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
                        placeholder="Condições de pagamento, informações bancárias ou observações para o cliente..."
                        className={textareaClassName}
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
                                value={taxPercentage}
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
                            <span>Subtotal</span>

                            <span className="font-semibold text-slate-800">
                                {formatCurrency({
                                    value: subtotal,
                                    currency,
                                })}
                            </span>
                        </div>

                        <div className="flex justify-between gap-4 text-slate-500">
                            <span>Imposto</span>

                            <span className="font-semibold text-slate-800">
                                {formatCurrency({
                                    value: taxAmount,
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
                                    value: total,
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
                        handleSave('draft')
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
                        handleSave('issued')
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