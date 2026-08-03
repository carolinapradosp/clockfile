// components/account/ChangePasswordForm.tsx

'use client';

import {
    KeyRound,
    Save,
} from 'lucide-react';

import {
    useActionState,
    useEffect,
    useRef,
} from 'react';

import {
    changeAccountPassword,
} from '@/app/actions/account';

import type {
    ChangePasswordActionState,
} from '@/interfaces/Account';

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

const initialState: ChangePasswordActionState =
    null;

export default function ChangePasswordForm() {
    const formRef =
        useRef<HTMLFormElement>(
            null
        );

    const [
        state,
        formAction,
        isPending,
    ] = useActionState(
        changeAccountPassword,
        initialState
    );

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
        }
    }, [state]);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <KeyRound size={21} />
                </div>

                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Alterar senha
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Ao alterar a senha, as outras sessões da sua conta serão encerradas.
                    </p>
                </div>
            </div>

            <form
                ref={formRef}
                action={formAction}
                className="mt-7 space-y-5"
            >
                <div>
                    <label
                        htmlFor="current-password"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Senha atual
                    </label>

                    <input
                        id="current-password"
                        name="currentPassword"
                        type="password"
                        required
                        autoComplete="current-password"
                        className={inputClassName}
                    />

                    {state &&
                        !state.success &&
                        state.fieldErrors
                            ?.currentPassword && (
                            <p className="mt-2 text-sm font-medium text-red-600">
                                {
                                    state.fieldErrors
                                        .currentPassword
                                }
                            </p>
                        )}
                </div>

                <div>
                    <label
                        htmlFor="new-password"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Nova senha
                    </label>

                    <input
                        id="new-password"
                        name="newPassword"
                        type="password"
                        required
                        minLength={8}
                        maxLength={128}
                        autoComplete="new-password"
                        className={inputClassName}
                    />

                    <p className="mt-2 text-xs text-slate-400">
                        Utilize entre 8 e 128 caracteres.
                    </p>

                    {state &&
                        !state.success &&
                        state.fieldErrors
                            ?.newPassword && (
                            <p className="mt-2 text-sm font-medium text-red-600">
                                {
                                    state.fieldErrors
                                        .newPassword
                                }
                            </p>
                        )}
                </div>

                <div>
                    <label
                        htmlFor="password-confirmation"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Confirmar nova senha
                    </label>

                    <input
                        id="password-confirmation"
                        name="passwordConfirmation"
                        type="password"
                        required
                        minLength={8}
                        maxLength={128}
                        autoComplete="new-password"
                        className={inputClassName}
                    />

                    {state &&
                        !state.success &&
                        state.fieldErrors
                            ?.passwordConfirmation && (
                            <p className="mt-2 text-sm font-medium text-red-600">
                                {
                                    state.fieldErrors
                                        .passwordConfirmation
                                }
                            </p>
                        )}
                </div>

                {state && (
                    <div
                        role="status"
                        className={
                            state.success
                                ? 'rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700'
                                : 'rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700'
                        }
                    >
                        {state.message}
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
                    >
                        <Save size={17} />

                        {isPending
                            ? 'Alterando...'
                            : 'Alterar senha'}
                    </button>
                </div>
            </form>
        </section>
    );
}