// components/layout/DashboardHeader.tsx

import { Bell } from 'lucide-react';

export default function DashboardHeader() {
    return (
        <header
            className="
        sticky top-0 z-30
        flex h-20 items-center
        border-b border-slate-200
        bg-white/90 px-4
        backdrop-blur-md
        sm:px-6 lg:px-8
      "
        >
            <div className="ml-14 flex w-full items-center justify-between lg:ml-0">
                <div>
                    <p className="text-sm text-slate-500">
                        Bem-vindo ao
                    </p>

                    <h1 className="text-lg font-bold text-slate-900">
                        Clockfile
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        aria-label="Notificações"
                        title="Notificações"
                        className="
              relative flex h-10 w-10
              items-center justify-center
              rounded-xl border border-slate-200
              bg-white text-slate-500
              transition-colors
              hover:bg-slate-100
              hover:text-slate-900
            "
                    >
                        <Bell size={19} />
                    </button>

                    <div
                        className="
              flex h-10 w-10 items-center
              justify-center rounded-full
              bg-slate-900
              text-sm font-bold text-white
            "
                        title="Usuário"
                    >
                        CP
                    </div>
                </div>
            </div>
        </header>
    );
}