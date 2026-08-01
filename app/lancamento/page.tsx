import LogoutButton from '@/components/auth/LogoutButton';
import Logo from '@/components/layout/Logo';
import CreateTask from '@/components/reports/CreateTask';

export default function Lancamento() {
    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <Logo />
                    <div className="flex items-center justify-between gap-4 mt-8">
                        <div>
                            <p className="mt-2 text-slate-500 md:text-base text-sm">
                                Add a new activity to the report.
                            </p>
                        </div>

                        <div>
                            <a href="/relatorio" className="md:text-base text-sm">
                                <u>Access report</u>
                            </a>

                            {' | '}
                            <LogoutButton />
                        </div>
                    </div>
                </div>

                <CreateTask />

            </div>
        </main>
    );
}