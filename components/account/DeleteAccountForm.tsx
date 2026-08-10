// components/account/DeleteAccountForm.tsx

'use client';

import {
    AlertTriangle,
    Trash2,
} from 'lucide-react';

import {
    useActionState,
    useState,
} from 'react';

import {
    deleteAccount,
} from '@/app/actions/account';

import type {
    DeleteAccountActionState,
} from '@/interfaces/Account';

const initialState: DeleteAccountActionState =
    null;

const inputClassName = `
  h-12
  w-full
  rounded-xl
  border
  border-red-200
  bg-white
  px-4
  text-sm
  text-slate-900
  outline-none
  transition-all
  placeholder:text-slate-400
  focus:border-red-500
  focus:ring-4
  focus:ring-red-500/10
`;

export default function DeleteAccountForm() {
    const [
        isExpanded,
        setIsExpanded,
    ] = useState(false);

    const [
        state,
        formAction,
        isPending,
    ] = useActionState(
        deleteAccount,
        initialState
    );

    return (
        <section className="rounded-2xl border border-red-200 bg-red-50/40 p-5 sm:p-6">
            <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <AlertTriangle
                        size={21}
                    />
                </div>

                <div>
                    <h2 className="text-lg font-bold text-red-900">
                        Excluir conta
                    </h2>

                    <p className="mt-1 text-sm leading-relaxed text-red-700/80">
                        Essa ação remove permanentemente sua conta e todos os dados relacionados.
                    </p>
                </div>
            </div>

            <div className="mt-6 rounded-xl border border-red-200 bg-white p-4">
                <p className="text-sm font-semibold text-red-900">
                    Serão excluídos:
                </p>

                <ul className="mt-3 space-y-2 text-sm text-red-700">
                    <li>
                        Todos os seus projetos
                    </li>

                    <li>
                        Todos os lançamentos e horas registradas
                    </li>

                    <li>
                        Todas as faturas e seus itens
                    </li>

                    <li>
                        Todas as sessões e os dados da conta
                    </li>
                </ul>
            </div>

            {!isExpanded ? (
                <button
                    type="button"
                    onClick={() =>
                        setIsExpanded(true)
                    }
                    className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                    <Trash2 size={17} />

                    Excluir minha conta
                </button>
            ) : (
                <form
                    action={formAction}
                    className="mt-6 space-y-5"
                >
                    <div>
                        <label
                            htmlFor="delete-account-password"
                            className="mb-2 block text-sm font-semibold text-red-900"
                        >
                            Confirme sua senha
                        </label>

                        <input
                            id="delete-account-password"
                            name="password"
                            type="password"
                            maxLength={12}
                            required
                            autoComplete="current-password"
                            className={inputClassName}
                        />

                        {state?.fieldErrors
                            ?.password && (
                                <p className="mt-2 text-sm font-medium text-red-600">
                                    {
                                        state.fieldErrors
                                            .password
                                    }
                                </p>
                            )}
                    </div>

                    <div>
                        <label
                            htmlFor="delete-account-confirmation"
                            className="mb-2 block text-sm font-semibold text-red-900"
                        >
                            Digite exatamente:
                        </label>

                        <p className="mb-2 rounded-lg bg-red-100 px-3 py-2 font-mono text-sm font-bold text-red-800">
                            EXCLUIR MINHA CONTA
                        </p>

                        <input
                            id="delete-account-confirmation"
                            name="confirmation"
                            type="text"
                            required
                            autoComplete="off"
                            className={inputClassName}
                        />

                        {state?.fieldErrors
                            ?.confirmation && (
                                <p className="mt-2 text-sm font-medium text-red-600">
                                    {
                                        state.fieldErrors
                                            .confirmation
                                    }
                                </p>
                            )}
                    </div>

                    {state && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-100 p-4 text-sm font-medium text-red-700"
                        >
                            {state.message}
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row">
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                                setIsExpanded(false)
                            }
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
                        >
                            <Trash2 size={17} />

                            {isPending
                                ? 'Excluindo...'
                                : 'Excluir permanentemente'}
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}