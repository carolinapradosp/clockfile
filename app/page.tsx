'use client';

import { useActionState } from 'react';
import { ActionState, handleLogin } from './actions/auth';

export default function Home() {
  const initialState: ActionState = null;
  const [state, formAction, isPending] = useActionState(handleLogin, initialState);
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

        {/* Header do Card */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Área Restrita
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Insira a senha de acesso para continuar
          </p>
        </div>

        {/* Formulário usando Server Action */}
        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2"
            >
              Senha
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Feedback de Erro */}
          {state?.error && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600 font-medium animate-shake">
              {state.error}
            </div>
          )}

          {/* Botão de Envio */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

      </div>
    </main>
  );
}