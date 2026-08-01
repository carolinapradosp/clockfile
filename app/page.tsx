import FormLogin from '@/components/auth/FormLogin';
import Logo from '@/components/layout/Logo';

export default function Home() {

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-6 text-center">
          <div className='flex items-center justify-center pb-8'>
            <div>
              <Logo />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Área Restrita
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Insira a senha de acesso para continuar
          </p>
        </div>
        <FormLogin />
      </div>
    </main>
  );
}