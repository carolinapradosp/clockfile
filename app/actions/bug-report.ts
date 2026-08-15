// app/actions/bug-report.ts

'use server';

import { headers } from 'next/headers';

import { sql } from '@/lib/db';

import { requireCurrentUser } from '@/lib/auth/current-user';

import type { CreateBugReportInput, CreateBugReportResult } from '@/interfaces/BugReport';

const MIN_SUBJECT_LENGTH = 3;
const MAX_SUBJECT_LENGTH = 200;

const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 5000;

function normalizeText(value: string): string {
    return value.trim();
}

function normalizePageUrl(value: string | null): string | null {
    if (!value) {
        return null;
    }

    const normalized = value.trim();

    if (!normalized) {
        return null;
    }

    /*
     * Limita o tamanho para impedir que
     * dados excessivos sejam persistidos.
     */
    return normalized.slice(0, 2000);
}

export async function createBugReport(input: CreateBugReportInput): Promise<CreateBugReportResult> {
    try {
        const user = await requireCurrentUser();

        const subject = normalizeText(input.subject);

        const message = normalizeText(input.message);

        const pageUrl = normalizePageUrl(input.pageUrl);

        const fieldErrors: {
            subject?: string;
            message?: string;
        } = {};

        if (subject.length < MIN_SUBJECT_LENGTH) {
            fieldErrors.subject = 'Informe um assunto com pelo menos 3 caracteres.';
        }

        if (subject.length > MAX_SUBJECT_LENGTH) {
            fieldErrors.subject = 'O assunto deve possuir no máximo 200 caracteres.';
        }

        if (message.length < MIN_MESSAGE_LENGTH) {
            fieldErrors.message = 'Descreva o problema com pelo menos 10 caracteres.';
        }

        if (message.length > MAX_MESSAGE_LENGTH) {
            fieldErrors.message = 'A descrição deve possuir no máximo 5.000 caracteres.';
        }

        if (Object.keys(fieldErrors).length > 0) {
            return {
                success: false,

                message: 'Revise os campos informados.',

                fieldErrors,
            };
        }

        const headerStore = await headers();

        const userAgent = headerStore.get('user-agent');

        const rows = await sql`
            INSERT INTO public.bug_reports (
                user_id,

                subject,
                message,

                page_url,
                user_agent,

                status,
                priority,

                created_at,
                updated_at
            )
            VALUES (
                ${user.id}::uuid,

                ${subject},
                ${message},

                ${pageUrl},
                ${userAgent},

                'open',
                'normal',

                NOW(),
                NOW()
            )

            RETURNING id
        `;

        const report = rows[0] as
            | {
                  id: string;
              }
            | undefined;

        if (!report) {
            throw new Error('O relato não foi retornado após a criação.');
        }

        return {
            success: true,

            message: 'Relato enviado com sucesso. Obrigado por ajudar a melhorar o Clockfile!',

            reportId: String(report.id),
        };
    } catch (error) {
        console.error('Erro ao criar relato de bug:', error);

        return {
            success: false,

            message: 'Não foi possível enviar o relato. Tente novamente.',
        };
    }
}
