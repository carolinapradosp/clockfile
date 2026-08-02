// components/auth/SignUpForm.tsx

'use client';

import Link from 'next/link';

import {
    Eye,
    EyeOff,
    Lock,
    Mail,
    Phone,
    User,
} from 'lucide-react';

import {
    useActionState,
    useState,
} from 'react';

import {
    registerUser,
    type RegisterActionState,
} from '@/app/actions/auth';

const initialState: RegisterActionState =
    null;

const inputClassName = `
  h-12
  w-full
  rounded-xl
  border
  border-slate-200
  bg-slate-50
  pl-11
  pr-4
  text-sm
  text-slate-900
  outline-none
  transition-all
  placeholder:text-slate-400
  focus:border-blue-500
  focus:bg-white
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

export default function SignUpForm() {
    const [
        state,
        formAction,
        isPending,
    ] = useActionState(
        registerUser,
        initialState
    );

    const [
        showPassword,
        setShowPassword,
    ] = useState(false);

    const [
        showPasswordConfirmation,
        setShowPasswordConfirmation,
    ] = useState(false);

    return (
        <form
            action={formAction}
            className="space-y-5"
        >
            {state && !state.success && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                >
                    {state.message}
                </div>
            )}

            <div>
                <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                >
                    Nome
                </label>

                <div className="relative">
                    <User
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        placeholder="Seu nome completo"
                        className={inputClassName}
                    />
                </div>

                <FieldError
                    message={
                        state?.fieldErrors?.name
                    }
                />
            </div>

            <div>
                <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                >
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

                <FieldError
                    message={
                        state?.fieldErrors?.email
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

                <div className="relative">
                    <Phone
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        placeholder="+55 11 99999-9999"
                        className={inputClassName}
                    />
                </div>

                <FieldError
                    message={
                        state?.fieldErrors?.phone
                    }
                />
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
                        type={
                            showPassword
                                ? 'text'
                                : 'password'
                        }
                        autoComplete="new-password"
                        required
                        minLength={8}
                        maxLength={128}
                        placeholder="Mínimo de 8 caracteres"
                        className={`${inputClassName} pr-12`}
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowPassword(
                                (current) => !current
                            )
                        }
                        aria-label={
                            showPassword
                                ? 'Ocultar senha'
                                : 'Mostrar senha'
                        }
                        className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                        {showPassword ? (
                            <EyeOff size={18} />
                        ) : (
                            <Eye size={18} />
                        )}
                    </button>
                </div>

                <FieldError
                    message={
                        state?.fieldErrors?.password
                    }
                />
            </div>

            <div>
                <label
                    htmlFor="passwordConfirmation"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                >
                    Confirmar senha
                </label>

                <div className="relative">
                    <Lock
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        id="passwordConfirmation"
                        name="passwordConfirmation"
                        type={
                            showPasswordConfirmation
                                ? 'text'
                                : 'password'
                        }
                        autoComplete="new-password"
                        required
                        minLength={8}
                        maxLength={128}
                        placeholder="Digite a senha novamente"
                        className={`${inputClassName} pr-12`}
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowPasswordConfirmation(
                                (current) => !current
                            )
                        }
                        aria-label={
                            showPasswordConfirmation
                                ? 'Ocultar confirmação'
                                : 'Mostrar confirmação'
                        }
                        className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                        {showPasswordConfirmation ? (
                            <EyeOff size={18} />
                        ) : (
                            <Eye size={18} />
                        )}
                    </button>
                </div>

                <FieldError
                    message={
                        state?.fieldErrors
                            ?.passwordConfirmation
                    }
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
            >
                {isPending
                    ? 'Criando conta...'
                    : 'Criar conta'}
            </button>

            <p className="text-center text-sm text-slate-500">
                Já possui uma conta?{' '}
                <Link
                    href="/"
                    className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                >
                    Fazer login
                </Link>
            </p>
        </form>
    );
}