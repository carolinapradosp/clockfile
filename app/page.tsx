// app/page.tsx

import FormLogin from '@/components/auth/FormLogin';
import Logo from '@/components/layout/Logo';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">


        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="mb-8">
            <Logo />


            <p className="mt-3 text-sm leading-relaxed text-slate-500 text-center">
              Acesse sua conta para gerenciar projetos, horas e faturas.
            </p>
          </div>

          <FormLogin />
        </section>


      </div>
    </main>
  );
}