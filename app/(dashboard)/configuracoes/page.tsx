// app/(dashboard)/configuracoes/page.tsx

import type {
    Metadata,
} from 'next';

import {
    Settings,
} from 'lucide-react';

import AccountProfileForm from '@/components/account/AccountProfileForm';
import ChangePasswordForm from '@/components/account/ChangePasswordForm';
// import DeleteAccountForm from '@/components/account/DeleteAccountForm';
import SessionSecurityCard from '@/components/account/SessionSecurityCard';

import {
    requireCurrentUser,
} from '@/lib/auth/current-user';

export const metadata: Metadata = {
    title: 'Configurações',
};

export default async function SettingsPage() {
    const user =
        await requireCurrentUser();

    return (
        <div className="mx-auto max-w-5xl">
            <header className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Settings size={21} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Configurações
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Gerencie seus dados, senha e segurança da conta.
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <AccountProfileForm
                    user={{
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                    }}
                />

                <ChangePasswordForm />

                <SessionSecurityCard />

                {/* <div className="lg:col-span-2">
                    <DeleteAccountForm />
                </div> */}
            </div>
        </div>
    );
}