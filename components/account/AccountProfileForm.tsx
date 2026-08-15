// components/account/AccountProfileForm.tsx

'use client';

import { Save, UserRound } from 'lucide-react';

import { useActionState, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { updateAccountProfile } from '@/app/actions/account';

import type { AccountProfileActionState } from '@/interfaces/Account';
import { formatPhone, sanitizeName } from '@/lib/utils';
import NameField from '../forms/NameField';
import EmailField from '../forms/EmailField';
import PhoneField from '../forms/PhoneField';

type AccountProfileFormProps = {
    user: {
        name: string;
        email: string;
        phone: string | null;
    };
};

const initialState: AccountProfileActionState = null;

export default function AccountProfileForm({ user }: AccountProfileFormProps) {
    const router = useRouter();

    const [name, setName] = useState(sanitizeName(user.name));

    const [phone, setPhone] = useState(formatPhone(user.phone ?? ''));

    const [state, formAction, isPending] = useActionState(updateAccountProfile, initialState);

    useEffect(() => {
        if (state?.success) {
            /*
             * Atualiza os dados
             * utilizados também
             * pela Sidebar.
             */
            router.refresh();
        }
    }, [state, router]);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <UserRound size={21} />
                </div>

                <div>
                    <h2 className="text-lg font-bold text-slate-900">Dados pessoais</h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Atualize as informações utilizadas na sua conta.
                    </p>
                </div>
            </div>

            <form action={formAction} className="mt-7 space-y-5">
                <NameField
                    id="account-name"
                    value={name}
                    onChange={setName}
                    error={!state?.success ? state?.fieldErrors?.name : undefined}
                />

                <EmailField
                    id="account-email"
                    defaultValue={user.email}
                    error={!state?.success ? state?.fieldErrors?.email : undefined}
                />

                <PhoneField
                    id="account-phone"
                    value={phone}
                    onChange={setPhone}
                    error={!state?.success ? state?.fieldErrors?.phone : undefined}
                />

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

                {/* AÇÃO */}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
                    >
                        <Save size={17} />

                        {isPending ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                </div>
            </form>
        </section>
    );
}
