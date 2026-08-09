// components/reports/ReportEntryForm.tsx

'use client';

import Link from 'next/link';
import { Save } from 'lucide-react';
import {
    useActionState,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useRouter } from 'next/navigation';

import {
    createReportEntry,
    updateReportEntry,
} from '@/app/actions/report';

import {
    durationToMinutes,
} from '@/lib/time';

import type {
    ReportEntry,
    ReportEntryActionState,
    ReportProjectOption,
} from '@/interfaces/ReportEntry';
import formatCurrency from '@/lib/utils';

type ReportEntryFormProps = {
    projects: ReportProjectOption[];
    entry?: ReportEntry;
    initialProjectId?: string;
};

const initialState: ReportEntryActionState = null;

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
  min-h-36
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

function FieldError({
    message,
}: {
    message?: string;
}) {
    if (!message) {
        return null;
    }

    return (
        <p className="mt-1 text-xs font-medium text-red-600">
            {message}
        </p>
    );
}


export default function ReportEntryForm({
    projects,
    entry,
    initialProjectId,
}: ReportEntryFormProps) {
    const router = useRouter();

    const action = entry
        ? updateReportEntry.bind(null, entry.id)
        : createReportEntry;

    const [state, formAction, isPending] =
        useActionState(action, initialState);

    const defaultProjectId =
        entry?.projectId ??
        initialProjectId ??
        '';

    const defaultProject = projects.find(
        (project) =>
            project.id === defaultProjectId
    );

    const [selectedProjectId, setSelectedProjectId] =
        useState(defaultProjectId);

    const [duration, setDuration] = useState(
        entry?.duration ?? ''
    );

    const [rate, setRate] = useState(
        entry?.rate !== null &&
            entry?.rate !== undefined
            ? String(entry.rate)
            : defaultProject?.defaultHourlyRate !== null &&
                defaultProject?.defaultHourlyRate !== undefined
                ? String(defaultProject.defaultHourlyRate)
                : ''
    );

    const selectedProject = useMemo(
        () =>
            projects.find(
                (project) =>
                    project.id === selectedProjectId
            ),
        [projects, selectedProjectId]
    );

    const durationMinutes =
        durationToMinutes(duration);

    const numericRate = Number(rate);

    const calculatedAmount =
        Number.isFinite(numericRate) &&
            numericRate >= 0 &&
            durationMinutes > 0
            ? Math.round(
                (durationMinutes / 60) *
                numericRate *
                100
            ) / 100
            : 0;

    const currency =
        selectedProject?.currency ??
        entry?.currency ??
        'USD';

    useEffect(() => {
        if (!state?.success) {
            return;
        }

        router.replace('/relatorios');
        router.refresh();
    }, [router, state]);

    function handleProjectChange(
        event: React.ChangeEvent<HTMLSelectElement>
    ) {
        const projectId = event.target.value;

        setSelectedProjectId(projectId);

        const project = projects.find(
            (item) => item.id === projectId
        );

        /*
         * Ao selecionar outro projeto, sugerimos
         * automaticamente o valor/hora configurado.
         *
         * O usuário ainda pode alterar o valor
         * manualmente depois.
         */
        if (
            project?.defaultHourlyRate !== null &&
            project?.defaultHourlyRate !== undefined
        ) {
            setRate(
                String(project.defaultHourlyRate)
            );
        } else {
            setRate('');
        }
    }

    return (
        <form
            action={formAction}
            className="space-y-8"
        >
            {state && !state.success && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                >
                    {state.message}
                </div>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">
                        Projeto e atividade
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Selecione o projeto e descreva o trabalho realizado.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label
                            htmlFor="projectId"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Projeto *
                        </label>

                        <select
                            id="projectId"
                            name="projectId"
                            required
                            value={selectedProjectId}
                            onChange={handleProjectChange}
                            className={inputClassName}
                        >
                            <option value="">
                                Selecione um projeto
                            </option>

                            {projects.map((project) => (
                                <option
                                    key={project.id}
                                    value={project.id}
                                >
                                    {project.name}
                                </option>
                            ))}
                        </select>

                        <FieldError
                            message={
                                !state?.success
                                    ? state?.fieldErrors?.projectId
                                    : undefined
                            }
                        />

                        {projects.length === 0 && (
                            <p className="mt-2 text-sm font-medium text-amber-700">
                                Nenhum projeto disponível. Cadastre um projeto antes de criar um lançamento.
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="task"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Tarefa *
                        </label>

                        <input
                            id="task"
                            name="task"
                            type="text"
                            required
                            defaultValue={entry?.task ?? ''}
                            placeholder="Ex.: WP-0075"
                            className={inputClassName}
                        />

                        <FieldError
                            message={
                                !state?.success
                                    ? state?.fieldErrors?.task
                                    : undefined
                            }
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="date"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Data *
                        </label>

                        <input
                            id="date"
                            name="date"
                            type="date"
                            required
                            defaultValue={
                                entry?.date ??
                                new Date()
                                    .toISOString()
                                    .slice(0, 10)
                            }
                            className={inputClassName}
                        />

                        <FieldError
                            message={
                                !state?.success
                                    ? state?.fieldErrors?.date
                                    : undefined
                            }
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="description"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Descrição *
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            required
                            defaultValue={
                                entry?.description ?? ''
                            }
                            placeholder="Descreva a atividade realizada..."
                            className={textareaClassName}
                        />

                        <FieldError
                            message={
                                !state?.success
                                    ? state?.fieldErrors?.description
                                    : undefined
                            }
                        />
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">
                        Horas e cobrança
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        O valor é calculado com base na duração e no rate informado.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="duration"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Duração *
                        </label>

                        <input
                            id="duration"
                            name="duration"
                            type="time"
                            required
                            value={duration}
                            onChange={(event) => {
                                setDuration(
                                    event.target.value
                                );
                            }}
                            step={60}
                            className={inputClassName}
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            Selecione as horas e os minutos trabalhados.
                        </p>

                        <FieldError
                            message={
                                !state?.success
                                    ? state?.fieldErrors?.duration
                                    : undefined
                            }
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="rate"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Valor por hora *
                        </label>

                        <input
                            id="rate"
                            name="rate"
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={rate}
                            onChange={(event) => {
                                setRate(event.target.value);
                            }}
                            placeholder="0.00"
                            className={inputClassName}
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            Moeda: {currency}
                        </p>

                        <FieldError
                            message={
                                !state?.success
                                    ? state?.fieldErrors?.rate
                                    : undefined
                            }
                        />
                    </div>
                </div>

                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                    <p className="text-sm font-medium text-emerald-800">
                        Valor calculado
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-700">
                        {formatCurrency({
                            value: calculatedAmount,
                            currency,
                        })}
                    </p>

                    <p className="mt-2 text-xs text-emerald-700/80">
                        {durationMinutes > 0
                            ? `${durationMinutes} minutos × ${formatCurrency({
                                value:
                                    Number.isFinite(numericRate)
                                        ? numericRate
                                        : 0,
                                currency,
                            })}/hora`
                            : 'Informe a duração para calcular o valor.'}
                    </p>
                </div>
            </section>

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <Link
                    href="/relatorios"
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                    Cancelar
                </Link>

                <button
                    type="submit"
                    disabled={
                        isPending ||
                        projects.length === 0
                    }
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save size={18} />

                    {isPending
                        ? 'Salvando...'
                        : entry
                            ? 'Salvar alterações'
                            : 'Salvar lançamento'}
                </button>
            </div>
        </form>
    );
}