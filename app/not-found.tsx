import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-3xl font-bold text-slate-900">
                Página não encontrada
            </h1>
            <p className="text-slate-500">
                A página que você está procurando não existe.
            </p>
            <Link
                href="/"
                className="underline"
            >
                Voltar para o login
            </Link>
        </div>
    );
}