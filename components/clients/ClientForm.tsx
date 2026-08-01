// components/clients/ClientForm.tsx

'use client';

import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';

import {
    createClient,
    updateClient,
} from '@/app/actions/clients';

import type {
    Client,
    ClientActionState,
    ClientStatus,
} from '@/interfaces/Client';

type ClientFormProps = {
    client?: Client;
};

const initialState: ClientActionState = null;

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
  min-h-32
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

export default function ClientForm({
    client,
}: ClientFormProps) {
    const router = useRouter();

    const action = client
        ? updateClient.bind(null, client.id)
        : createClient;

    const [state, formAction, isPending] =
        useActionState(action, initialState);

    useEffect(() => {
        if (!state?.success) {
            return;
        }

        router.replace(
            `/clientes/${state.clientId}`
        );

        router.refresh();
    }, [router, state]);

    const status: ClientStatus =
        client?.status ?? 'active';

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
                        Informações principais
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Dados básicos para identificar o cliente.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Nome do cliente *
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            defaultValue={client?.name ?? ''}
                            placeholder="Nome completo"
                            className={inputClassName}
                        />

                        <FieldError
                            message={
                                !state?.success
                                    ? state?.fieldErrors?.name
                                    : undefined
                            }
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="companyName"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Empresa
                        </label>

                        <input
                            id="companyName"
                            name="companyName"
                            type="text"
                            defaultValue={
                                client?.companyName ?? ''
                            }
                            placeholder="Nome da empresa"
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            E-mail
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={client?.email ?? ''}
                            placeholder="cliente@email.com"
                            className={inputClassName}
                        />

                        <FieldError
                            message={
                                !state?.success
                                    ? state?.fieldErrors?.email
                                    : undefined
                            }
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="phone"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Telefone
                        </label>

                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            defaultValue={client?.phone ?? ''}
                            placeholder="+55 11 99999-9999"
                            className={inputClassName}
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
                            defaultValue={status}
                            className={inputClassName}
                        >
                            <option value="active">
                                Ativo
                            </option>

                            <option value="inactive">
                                Inativo
                            </option>

                            {client?.status ===
                                'archived' && (
                                    <option value="archived">
                                        Arquivado
                                    </option>
                                )}
                        </select>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">
                        Endereço
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Essas informações poderão ser usadas nas faturas.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label
                            htmlFor="addressLine1"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Endereço
                        </label>

                        <input
                            id="addressLine1"
                            name="addressLine1"
                            type="text"
                            defaultValue={
                                client?.addressLine1 ?? ''
                            }
                            placeholder="Rua, avenida e número"
                            className={inputClassName}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="addressLine2"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Complemento
                        </label>

                        <input
                            id="addressLine2"
                            name="addressLine2"
                            type="text"
                            defaultValue={
                                client?.addressLine2 ?? ''
                            }
                            placeholder="Sala, apartamento ou complemento"
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="city"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Cidade
                        </label>

                        <input
                            id="city"
                            name="city"
                            type="text"
                            defaultValue={client?.city ?? ''}
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="state"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Estado
                        </label>

                        <input
                            id="state"
                            name="state"
                            type="text"
                            defaultValue={client?.state ?? ''}
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="postalCode"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            CEP / Código postal
                        </label>

                        <input
                            id="postalCode"
                            name="postalCode"
                            type="text"
                            defaultValue={
                                client?.postalCode ?? ''
                            }
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="countryCode"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            País
                        </label>

                        <input
                            id="countryCode"
                            name="countryCode"
                            type="text"
                            maxLength={2}
                            defaultValue={
                                client?.countryCode ?? 'BR'
                            }
                            placeholder="BR"
                            className={`${inputClassName} uppercase`}
                        />

                        <FieldError
                            message={
                                !state?.success
                                    ? state?.fieldErrors
                                        ?.countryCode
                                    : undefined
                            }
                        />
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">
                        Observações
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Anotações internas sobre o cliente.
                    </p>
                </div>

                <label
                    htmlFor="notes"
                    className="sr-only"
                >
                    Observações
                </label>

                <textarea
                    id="notes"
                    name="notes"
                    defaultValue={client?.notes ?? ''}
                    placeholder="Adicione observações, preferências ou informações importantes..."
                    className={textareaClassName}
                />
            </section>

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <Link
                    href={
                        client
                            ? `/clientes/${client.id}`
                            : '/clientes'
                    }
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                    Cancelar
                </Link>

                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
                >
                    <Save size={18} />

                    {isPending
                        ? 'Salvando...'
                        : client
                            ? 'Salvar alterações'
                            : 'Cadastrar cliente'}
                </button>
            </div>
        </form>
    );
}