// components/auth/FormLogin.tsx

'use client';

import Link from 'next/link';

import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

import { useActionState, useState } from 'react';

import { loginUser, type LoginActionState } from '@/app/actions/auth';
import FieldError from './FieldError';
import { inputClassName } from '@/lib/utils';

const initialState: LoginActionState = null;

export default function FormLogin() {
    const [state, formAction, isPending] = useActionState(loginUser, initialState);

    const [showPassword, setShowPassword] = useState(false);

    return (
        <form action={formAction} className="space-y-5">
            {state && !state.success && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                >
                    {state.message}
                </div>
            )}

            <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                    E-mail
                </label>

                <div className="relative">
                    <Mail
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="voce@exemplo.com"
                        className={inputClassName}
                    />
                </div>

                <FieldError message={state?.fieldErrors?.email} />
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                >
                    Senha
                </label>

                <div className="relative">
                    <Lock
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        placeholder="Sua senha"
                        className={`${inputClassName} pr-12`}
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <FieldError message={state?.fieldErrors?.password} />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
            >
                {isPending ? 'Entrando...' : 'Entrar'}
            </button>

            <p className="text-center text-sm text-slate-500">
                Ainda não possui uma conta?{' '}
                <Link
                    href="/cadastro"
                    className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                >
                    Criar conta
                </Link>
            </p>
        </form>
    );
}
