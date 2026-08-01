'use client';

import {
    type ActionState,
    handleLogin,
} from '@/app/actions/auth';

import { useActionState } from 'react';

export default function FormLogin() {
    const initialState: ActionState = null;

    const [
        state,
        formAction,
        isPending,
    ] = useActionState(
        handleLogin,
        initialState
    );

    return (
        <form
            action={formAction}
            className="space-y-4"
        >
            <div>
                <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                    Senha
                </label>

                <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
            </div>

            {state?.error && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600"
                >
                    {state.error}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full cursor-pointer rounded-xl bg-[#42AE39] py-3 text-sm font-semibold text-white transition-all hover:bg-[#36932C] focus:outline-none focus:ring-2 focus:ring-[#42AE39]/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isPending
                    ? 'Verificando...'
                    : 'Entrar'}
            </button>
        </form>
    );
}