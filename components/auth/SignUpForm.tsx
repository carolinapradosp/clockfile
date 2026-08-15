// components/auth/SignUpForm.tsx

'use client';

import Link from 'next/link';

import {
    Eye,
    EyeOff,
    Lock,
} from 'lucide-react';

import {
    useActionState,
    useState,
} from 'react';

import {
    registerUser,
    type RegisterActionState,
} from '@/app/actions/auth';
import { inputClassName } from '@/lib/utils';
import PasswordRequirement from './PasswordRequirement';
import FieldError from './FieldError';
import NameField from '../forms/NameField';
import EmailField from '../forms/EmailField';
import PhoneField from '../forms/PhoneField';

const initialState: RegisterActionState =
    null;


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

    const [
        password,
        setPassword,
    ] = useState('');

    const [
        passwordConfirmation,
        setPasswordConfirmation,
    ] = useState('');

    const [
        name,
        setName,
    ] = useState('');

    const [
        phone,
        setPhone,
    ] = useState('');

    const hasMinimumLength =
        password.length >= 8;

    const hasMaximumLength =
        password.length <= 12;


    const hasUppercase =
        /[A-Z]/.test(password);

    const hasNumber =
        /\d/.test(password);

    const passwordIsStrong =
        hasMinimumLength &&
        hasMaximumLength &&
        hasUppercase &&
        hasNumber;

    const passwordsMatch =
        password.length > 0 &&
        passwordConfirmation.length > 0 &&
        password ===
        passwordConfirmation;

    const canSubmit =
        passwordIsStrong &&
        passwordsMatch &&
        !isPending;

    return (
        <form
            action={formAction}
            className="space-y-5"
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

            <NameField
                value={name}
                onChange={setName}
                error={
                    state?.fieldErrors?.name
                }
            />

            <EmailField
                defaultValue=""
                error={
                    state?.fieldErrors?.email
                }
            />

            <PhoneField
                value={phone}
                onChange={setPhone}
                error={
                    state?.fieldErrors?.phone
                }
            />

            {/* SENHA */}

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
                        maxLength={12}
                        value={password}
                        onChange={(
                            event
                        ) =>
                            setPassword(
                                event
                                    .target
                                    .value
                            )
                        }
                        placeholder="Crie uma senha forte"
                        className={`${inputClassName} pr-12`}
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowPassword(
                                (
                                    current
                                ) =>
                                    !current
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
                            <EyeOff
                                size={18}
                            />
                        ) : (
                            <Eye
                                size={18}
                            />
                        )}
                    </button>
                </div>

                {/* REGRAS DA SENHA */}

                <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3">
                    <p className="mb-2 text-xs font-semibold text-slate-600">
                        Sua senha deve conter:
                    </p>

                    <PasswordRequirement
                        valid={
                            hasMinimumLength &&
                            hasMaximumLength
                        }
                    >
                        Entre 8 e 12 caracteres
                    </PasswordRequirement>

                    <PasswordRequirement
                        valid={
                            hasUppercase
                        }
                    >
                        Pelo menos uma letra maiúscula
                    </PasswordRequirement>

                    <PasswordRequirement
                        valid={
                            hasNumber
                        }
                    >
                        Pelo menos um número
                    </PasswordRequirement>
                </div>

                <FieldError
                    message={
                        state
                            ?.fieldErrors
                            ?.password
                    }
                />
            </div>

            {/* CONFIRMAÇÃO */}

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
                        maxLength={12}
                        value={
                            passwordConfirmation
                        }
                        onChange={(
                            event
                        ) =>
                            setPasswordConfirmation(
                                event
                                    .target
                                    .value
                            )
                        }
                        placeholder="Digite a senha novamente"
                        className={`${inputClassName} pr-12`}
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowPasswordConfirmation(
                                (
                                    current
                                ) =>
                                    !current
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
                            <EyeOff
                                size={18}
                            />
                        ) : (
                            <Eye
                                size={18}
                            />
                        )}
                    </button>
                </div>

                {passwordConfirmation && (
                    <div className="mt-3">
                        <PasswordRequirement
                            valid={
                                passwordsMatch
                            }
                        >
                            {passwordsMatch
                                ? 'As senhas coincidem'
                                : 'As senhas não coincidem'}
                        </PasswordRequirement>
                    </div>
                )}

                <FieldError
                    message={
                        state
                            ?.fieldErrors
                            ?.passwordConfirmation
                    }
                />
            </div>

            {/* SUBMIT */}

            <button
                type="submit"
                disabled={
                    !canSubmit
                }
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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