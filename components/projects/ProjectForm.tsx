// components/projects/ProjectForm.tsx

'use client';

import Link from 'next/link';

import { Save } from 'lucide-react';

import {
    useActionState,
    useEffect,
} from 'react';

import {
    useRouter,
} from 'next/navigation';

import {
    createProject,
    updateProject,
} from '@/app/actions/projects';

import type {
    Project,
    ProjectActionState,
    ProjectStatus,
} from '@/interfaces/Project';

type ProjectFormProps = {
    project?: Project;
};

const initialState:
    ProjectActionState = null;

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
        <p className="mt-2 text-xs font-medium text-red-600">
            {message}
        </p>
    );
}

export default function ProjectForm({
    project,
}: ProjectFormProps) {
    const router = useRouter();

    const action = project
        ? updateProject.bind(
            null,
            project.id
        )
        : createProject;

    const [
        state,
        formAction,
        isPending,
    ] = useActionState(
        action,
        initialState
    );

    useEffect(() => {
        if (!state?.success) {
            return;
        }

        router.replace(
            `/projetos/${state.projectId}`
        );

        router.refresh();
    }, [router, state]);

    const selectedStatus:
        ProjectStatus =
        project?.status ??
        'active';

    return (
        <form
            action={formAction}
            className="space-y-8"
        >
            {state &&
                !state.success && (
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
                        Informações principais
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Defina os dados básicos do projeto.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Nome do projeto *
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            defaultValue={
                                project?.name ?? ''
                            }
                            placeholder="Ex.: Website institucional"
                            className={inputClassName}
                        />

                        <FieldError
                            message={
                                !state?.success
                                    ? state
                                        ?.fieldErrors
                                        ?.name
                                    : undefined
                            }
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="description"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Descrição
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            defaultValue={
                                project
                                    ?.description ??
                                ''
                            }
                            placeholder="Descreva o escopo e as informações importantes do projeto."
                            className={
                                textareaClassName
                            }
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="status"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Status
                        </label>

                        <select
                            id="status"
                            name="status"
                            defaultValue={
                                selectedStatus
                            }
                            className={inputClassName}
                        >
                            <option value="draft">
                                Rascunho
                            </option>

                            <option value="active">
                                Ativo
                            </option>

                            <option value="paused">
                                Pausado
                            </option>

                            <option value="completed">
                                Concluído
                            </option>


                        </select>
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
                            name="currency"
                            required
                            defaultValue={
                                project?.currency ?? 'BRL'
                            }
                            className={inputClassName}
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

                        <FieldError
                            message={
                                !state?.success
                                    ? state?.fieldErrors
                                        ?.currency
                                    : undefined
                            }
                        />
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">
                        Cobrança
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Configure o valor padrão usado nos lançamentos de horas.
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="defaultHourlyRate"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Valor por hora
                    </label>

                    <input
                        id="defaultHourlyRate"
                        name="defaultHourlyRate"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={
                            project
                                ?.defaultHourlyRate ??
                            ''
                        }
                        placeholder="0.00"
                        className={inputClassName}
                    />

                    <FieldError
                        message={
                            !state?.success
                                ? state
                                    ?.fieldErrors
                                    ?.defaultHourlyRate
                                : undefined
                        }
                    />
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">
                        Dados de faturamento
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Estes dados serão preenchidos automaticamente ao criar uma fatura para este projeto.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="billingName"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Nome do destinatário
                        </label>

                        <input
                            id="billingName"
                            name="billingName"
                            type="text"
                            defaultValue={
                                project?.billing.name ??
                                ''
                            }
                            placeholder="Nome do destinatário"
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="billingCompany"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Empresa
                        </label>

                        <input
                            id="billingCompany"
                            name="billingCompany"
                            type="text"
                            defaultValue={
                                project?.billing.company ??
                                ''
                            }
                            placeholder="Nome da empresa"
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="billingEmail"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            E-mail
                        </label>

                        <input
                            id="billingEmail"
                            name="billingEmail"
                            type="email"
                            defaultValue={
                                project?.billing.email ??
                                ''
                            }
                            placeholder="cliente@empresa.com"
                            className={inputClassName}
                        />

                        <FieldError
                            message={
                                !state?.success
                                    ? state
                                        ?.fieldErrors
                                        ?.billingEmail
                                    : undefined
                            }
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="billingPhone"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Telefone
                        </label>

                        <input
                            id="billingPhone"
                            name="billingPhone"
                            type="tel"
                            defaultValue={
                                project?.billing.phone ??
                                ''
                            }
                            placeholder="+55 11 99999-9999"
                            className={inputClassName}
                        />

                        <FieldError
                            message={
                                !state?.success
                                    ? state
                                        ?.fieldErrors
                                        ?.billingPhone
                                    : undefined
                            }
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="billingAddressLine1"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Endereço
                        </label>

                        <input
                            id="billingAddressLine1"
                            name="billingAddressLine1"
                            type="text"
                            defaultValue={
                                project?.billing
                                    .addressLine1 ?? ''
                            }
                            placeholder="Rua, número e endereço principal"
                            className={inputClassName}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="billingAddressLine2"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Complemento
                        </label>

                        <input
                            id="billingAddressLine2"
                            name="billingAddressLine2"
                            type="text"
                            defaultValue={
                                project?.billing
                                    .addressLine2 ?? ''
                            }
                            placeholder="Sala, apartamento ou complemento"
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="billingCity"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Cidade
                        </label>

                        <input
                            id="billingCity"
                            name="billingCity"
                            type="text"
                            defaultValue={
                                project?.billing.city ??
                                ''
                            }
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="billingState"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Estado
                        </label>

                        <input
                            id="billingState"
                            name="billingState"
                            type="text"
                            defaultValue={
                                project?.billing.state ??
                                ''
                            }
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="billingPostalCode"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            CEP / Código postal
                        </label>

                        <input
                            id="billingPostalCode"
                            name="billingPostalCode"
                            type="text"
                            defaultValue={
                                project?.billing
                                    .postalCode ?? ''
                            }
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="billingCountryCode"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            País
                        </label>

                        <input
                            id="billingCountryCode"
                            name="billingCountryCode"
                            type="text"
                            maxLength={2}
                            defaultValue={
                                project?.billing
                                    .countryCode ?? 'BR'
                            }
                            placeholder="BR"
                            className={`${inputClassName} uppercase`}
                        />

                        <FieldError
                            message={
                                !state?.success
                                    ? state
                                        ?.fieldErrors
                                        ?.billingCountryCode
                                    : undefined
                            }
                        />
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">
                        Período
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        As datas são opcionais e ajudam a acompanhar o ciclo do projeto.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="startDate"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Data de início
                        </label>

                        <input
                            id="startDate"
                            name="startDate"
                            type="date"
                            defaultValue={
                                project?.startDate ??
                                ''
                            }
                            className={inputClassName}
                        />

                        <FieldError
                            message={
                                !state?.success
                                    ? state
                                        ?.fieldErrors
                                        ?.startDate
                                    : undefined
                            }
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="endDate"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Data de encerramento
                        </label>

                        <input
                            id="endDate"
                            name="endDate"
                            type="date"
                            defaultValue={
                                project?.endDate ??
                                ''
                            }
                            className={inputClassName}
                        />

                        <FieldError
                            message={
                                !state?.success
                                    ? state
                                        ?.fieldErrors
                                        ?.endDate
                                    : undefined
                            }
                        />
                    </div>
                </div>
            </section>

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <Link
                    href={
                        project
                            ? `/projetos/${project.id}`
                            : '/projetos'
                    }
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                    Cancelar
                </Link>

                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save size={18} />

                    {isPending
                        ? 'Salvando...'
                        : project
                            ? 'Salvar alterações'
                            : 'Cadastrar projeto'}
                </button>
            </div>
        </form>
    );
}