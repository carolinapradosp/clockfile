// components/account/SessionSecurityCard.tsx

'use client';

import {
  LogOut,
  ShieldCheck,
} from 'lucide-react';

import {
  useState,
  useTransition,
} from 'react';

import {
  revokeOtherSessions,
} from '@/app/actions/account';

export default function SessionSecurityCard() {
  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    message,
    setMessage,
  ] = useState<{
    success: boolean;
    text: string;
  } | null>(null);

  function handleRevokeSessions() {
    const confirmed =
      window.confirm(
        'Deseja encerrar todas as outras sessões da sua conta? A sessão atual permanecerá ativa.'
      );

    if (!confirmed) {
      return;
    }

    startTransition(
      async () => {
        setMessage(null);

        try {
          const result =
            await revokeOtherSessions();

          setMessage({
            success:
              result.success,

            text:
              result.message,
          });
        } catch (error) {
          console.error(
            'Erro ao encerrar sessões:',
            error
          );

          setMessage({
            success: false,

            text:
              'Não foi possível encerrar as outras sessões.',
          });
        }
      }
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <ShieldCheck size={21} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Sessões e segurança
          </h2>

          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Encerre acessos realizados em outros navegadores ou dispositivos.
          </p>
        </div>
      </div>

      <div className="mt-7 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">
          Encerrar outras sessões
        </p>

        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          Sua sessão atual continuará funcionando normalmente.
        </p>

        <button
          type="button"
          onClick={
            handleRevokeSessions
          }
          disabled={isPending}
          className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
        >
          <LogOut size={17} />

          {isPending
            ? 'Encerrando...'
            : 'Encerrar outras sessões'}
        </button>
      </div>

      {message && (
        <div
          role="status"
          className={
            message.success
              ? 'mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700'
              : 'mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700'
          }
        >
          {message.text}
        </div>
      )}
    </section>
  );
}