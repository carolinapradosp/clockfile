// components/support/ReportBugModal.tsx

'use client';

import {
    Bug,
    CheckCircle2,
    LoaderCircle,
    Send,
    X,
} from 'lucide-react';

import {
    useState,
} from 'react';

import {
    createPortal,
} from 'react-dom';

import {
    createBugReport,
} from '@/app/actions/bug-report';

type ReportBugModalProps = {
    open: boolean;
    onClose: () => void;
};

export default function ReportBugModal({
    open,
    onClose,
}: ReportBugModalProps) {
    const [
        subject,
        setSubject,
    ] = useState('');

    const [
        message,
        setMessage,
    ] = useState('');

    const [
        includeTechnicalInfo,
        setIncludeTechnicalInfo,
    ] = useState(true);

    const [
        isPending,
        setIsPending,
    ] = useState(false);

    const [
        result,
        setResult,
    ] = useState<{
        success: boolean;
        message: string;

        fieldErrors?: {
            subject?: string;
            message?: string;
        };
    } | null>(null);

    if (
        !open ||
        typeof document === 'undefined'
    ) {
        return null;
    }

    function handleClose() {
        if (isPending) {
            return;
        }

        setSubject('');
        setMessage('');
        setIncludeTechnicalInfo(true);
        setResult(null);

        onClose();
    }

    async function handleSubmit(
        event:
            React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (isPending) {
            return;
        }

        try {
            setIsPending(true);
            setResult(null);

            const pageUrl =
                includeTechnicalInfo
                    ? `${window.location.pathname}${window.location.search}`
                    : null;

            const response =
                await createBugReport({
                    subject,
                    message,
                    pageUrl,
                });

            setResult(response);

            if (
                response.success
            ) {
                setSubject('');
                setMessage('');
            }
        } catch (error) {
            console.error(
                'Erro ao enviar relato:',
                error
            );

            setResult({
                success: false,

                message:
                    'Não foi possível enviar o relato. Tente novamente.',
            });
        } finally {
            setIsPending(false);
        }
    }

    return createPortal(
        <div
            className="
                fixed
                inset-0
                z-[9999]
                flex
                items-center
                justify-center
                bg-slate-950/50
                px-4
                py-8
                backdrop-blur-sm
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="bug-report-title"
        >
            {/* OVERLAY */}

            <button
                type="button"
                aria-label="Fechar modal"
                onClick={
                    handleClose
                }
                className="absolute inset-0 cursor-default"
            />

            {/* MODAL */}

            <div
                className="
                    relative
                    z-10
                    max-h-[calc(100vh-4rem)]
                    w-full
                    max-w-lg
                    overflow-y-auto
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-2xl
                "
            >
                {/* CABEÇALHO */}

                <div className="flex items-start gap-4 border-b border-slate-100 p-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Bug
                            size={21}
                        />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h2
                            id="bug-report-title"
                            className="text-lg font-bold text-slate-900"
                        >
                            Reportar um problema
                        </h2>

                        <p className="mt-1 text-sm leading-relaxed text-slate-500">
                            Encontrou algo que não está funcionando? Conte o que aconteceu.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={
                            handleClose
                        }
                        disabled={
                            isPending
                        }
                        aria-label="Fechar"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                {result?.success ? (
                    <div className="p-6">
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <CheckCircle2
                                    size={24}
                                />
                            </div>

                            <h3 className="mt-4 font-bold text-emerald-900">
                                Relato enviado!
                            </h3>

                            <p className="mt-2 text-sm leading-relaxed text-emerald-700">
                                {
                                    result.message
                                }
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={
                                handleClose
                            }
                            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                        >
                            Fechar
                        </button>
                    </div>
                ) : (
                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="p-6"
                    >
                        {/* ASSUNTO */}

                        <div>
                            <label
                                htmlFor="bug-subject"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Assunto
                            </label>

                            <input
                                id="bug-subject"
                                type="text"
                                value={
                                    subject
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSubject(
                                        event.target.value
                                    )
                                }
                                required
                                minLength={
                                    3
                                }
                                maxLength={
                                    200
                                }
                                placeholder="Ex.: Não consigo salvar uma fatura"
                                className="
                                    h-12
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-4
                                    text-sm
                                    text-slate-900
                                    outline-none
                                    transition-all
                                    placeholder:text-slate-400
                                    focus:border-blue-500
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-blue-500/10
                                "
                            />

                            {result &&
                                !result.success &&
                                result
                                    .fieldErrors
                                    ?.subject && (
                                    <p className="mt-2 text-xs font-medium text-red-600">
                                        {
                                            result
                                                .fieldErrors
                                                .subject
                                        }
                                    </p>
                                )}
                        </div>

                        {/* DESCRIÇÃO */}

                        <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between gap-4">
                                <label
                                    htmlFor="bug-message"
                                    className="block text-sm font-semibold text-slate-700"
                                >
                                    O que aconteceu?
                                </label>

                                <span className="text-xs text-slate-400">
                                    {
                                        message.length
                                    }
                                    /5000
                                </span>
                            </div>

                            <textarea
                                id="bug-message"
                                value={
                                    message
                                }
                                onChange={(
                                    event
                                ) =>
                                    setMessage(
                                        event.target.value
                                    )
                                }
                                required
                                minLength={
                                    10
                                }
                                maxLength={
                                    5000
                                }
                                rows={6}
                                placeholder="Explique o que você estava tentando fazer, o que esperava que acontecesse e o que aconteceu de fato..."
                                className="
                                    w-full
                                    resize-y
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-4
                                    py-3
                                    text-sm
                                    leading-relaxed
                                    text-slate-900
                                    outline-none
                                    transition-all
                                    placeholder:text-slate-400
                                    focus:border-blue-500
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-blue-500/10
                                "
                            />

                            {result &&
                                !result.success &&
                                result
                                    .fieldErrors
                                    ?.message && (
                                    <p className="mt-2 text-xs font-medium text-red-600">
                                        {
                                            result
                                                .fieldErrors
                                                .message
                                        }
                                    </p>
                                )}
                        </div>

                        {/* INFORMAÇÕES TÉCNICAS */}

                        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <input
                                type="checkbox"
                                checked={
                                    includeTechnicalInfo
                                }
                                onChange={(
                                    event
                                ) =>
                                    setIncludeTechnicalInfo(
                                        event.target.checked
                                    )
                                }
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600"
                            />

                            <div>
                                <p className="text-sm font-semibold text-slate-700">
                                    Incluir informações técnicas
                                </p>

                                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                    Envia a página atual e informações do navegador para ajudar a identificar o problema.
                                </p>
                            </div>
                        </label>

                        {/* ERRO GERAL */}

                        {result &&
                            !result.success && (
                                <div
                                    role="alert"
                                    className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                                >
                                    {
                                        result.message
                                    }
                                </div>
                            )}

                        {/* AÇÕES */}

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={
                                    handleClose
                                }
                                disabled={
                                    isPending
                                }
                                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    isPending
                                }
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
                            >
                                {isPending ? (
                                    <>
                                        <LoaderCircle
                                            size={17}
                                            className="animate-spin"
                                        />

                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send
                                            size={17}
                                        />

                                        Enviar relato
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>,
        document.body
    );
}