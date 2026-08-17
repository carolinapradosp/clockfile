// components/account/ChangePasswordForm.tsx

'use client';

import { Eye, EyeOff, KeyRound, Save } from 'lucide-react';

import { useActionState, useState } from 'react';

import { changeAccountPassword } from '@/app/actions/account';

import type { ChangePasswordActionState } from '@/interfaces/Account';
import PasswordRequirement from '../auth/PasswordRequirement';
import { inputClassNameNoIcon } from '@/lib/utils';

const initialState: ChangePasswordActionState = null;

export default function ChangePasswordForm() {
    const [state, formAction, isPending] = useActionState(changeAccountPassword, initialState);

    const [currentPassword, setCurrentPassword] = useState('');

    const [newPassword, setNewPassword] = useState('');

    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);

    const [showNewPassword, setShowNewPassword] = useState(false);

    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const hasMinimumLength = newPassword.length >= 8;

    const hasMaximumLength = newPassword.length <= 12;

    const hasUppercase = /[A-Z]/.test(newPassword);

    const hasNumber = /\d/.test(newPassword);

    const passwordIsStrong = hasMinimumLength && hasMaximumLength && hasUppercase && hasNumber;

    const passwordsMatch =
        newPassword.length > 0 &&
        passwordConfirmation.length > 0 &&
        newPassword === passwordConfirmation;

    const isDifferentFromCurrent =
        currentPassword.length > 0 && newPassword.length > 0 && currentPassword !== newPassword;

    const canSubmit =
        currentPassword.length > 0 &&
        passwordIsStrong &&
        passwordsMatch &&
        isDifferentFromCurrent &&
        !isPending;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <KeyRound size={21} />
                </div>

                <div>
                    <h2 className="text-lg font-bold text-slate-900">Alterar senha</h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Ao alterar a senha, as outras sessões da sua conta serão encerradas.
                    </p>
                </div>
            </div>

            <form action={formAction} className="mt-7 space-y-5">
                {/* SENHA ATUAL */}

                <div>
                    <label
                        htmlFor="current-password"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Senha atual
                    </label>

                    <div className="relative">
                        <input
                            id="current-password"
                            name="currentPassword"
                            maxLength={12}
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                            required
                            autoComplete="current-password"
                            className={inputClassNameNoIcon}
                        />

                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword((current) => !current)}
                            aria-label={
                                showCurrentPassword ? 'Ocultar senha atual' : 'Mostrar senha atual'
                            }
                            className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {state && !state.success && state.fieldErrors?.currentPassword && (
                        <p className="mt-2 text-sm font-medium text-red-600">
                            {state.fieldErrors.currentPassword}
                        </p>
                    )}
                </div>

                {/* NOVA SENHA */}

                <div>
                    <label
                        htmlFor="new-password"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Nova senha
                    </label>

                    <div className="relative">
                        <input
                            id="new-password"
                            name="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            required
                            minLength={8}
                            maxLength={12}
                            autoComplete="new-password"
                            placeholder="Crie uma senha forte"
                            className={inputClassNameNoIcon}
                        />

                        <button
                            type="button"
                            onClick={() => setShowNewPassword((current) => !current)}
                            aria-label={
                                showNewPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'
                            }
                            className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3">
                        <p className="mb-2 text-xs font-semibold text-slate-600">
                            Sua nova senha deve conter:
                        </p>

                        <PasswordRequirement valid={hasMinimumLength && hasMaximumLength}>
                            Entre 8 e 12 caracteres
                        </PasswordRequirement>

                        <PasswordRequirement valid={hasUppercase}>
                            Pelo menos uma letra maiúscula
                        </PasswordRequirement>

                        <PasswordRequirement valid={hasNumber}>
                            Pelo menos um número
                        </PasswordRequirement>

                        <PasswordRequirement valid={isDifferentFromCurrent}>
                            Ser diferente da senha atual
                        </PasswordRequirement>
                    </div>

                    {state && !state.success && state.fieldErrors?.newPassword && (
                        <p className="mt-2 text-sm font-medium text-red-600">
                            {state.fieldErrors.newPassword}
                        </p>
                    )}
                </div>

                {/* CONFIRMAÇÃO */}

                <div>
                    <label
                        htmlFor="password-confirmation"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Confirmar nova senha
                    </label>

                    <div className="relative">
                        <input
                            id="password-confirmation"
                            name="passwordConfirmation"
                            type={showPasswordConfirmation ? 'text' : 'password'}
                            value={passwordConfirmation}
                            onChange={(event) => setPasswordConfirmation(event.target.value)}
                            required
                            minLength={8}
                            maxLength={12}
                            autoComplete="new-password"
                            placeholder="Digite a nova senha novamente"
                            className={inputClassNameNoIcon}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPasswordConfirmation((current) => !current)}
                            aria-label={
                                showPasswordConfirmation
                                    ? 'Ocultar confirmação'
                                    : 'Mostrar confirmação'
                            }
                            className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                            {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {passwordConfirmation && (
                        <div className="mt-3">
                            <PasswordRequirement valid={passwordsMatch}>
                                {passwordsMatch ? 'As senhas coincidem' : 'As senhas não coincidem'}
                            </PasswordRequirement>
                        </div>
                    )}

                    {state && !state.success && state.fieldErrors?.passwordConfirmation && (
                        <p className="mt-2 text-sm font-medium text-red-600">
                            {state.fieldErrors.passwordConfirmation}
                        </p>
                    )}
                </div>

                {/* FEEDBACK */}

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

                {/* SUBMIT */}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Save size={17} />

                        {isPending ? 'Alterando...' : 'Alterar senha'}
                    </button>
                </div>
            </form>
        </section>
    );
}
