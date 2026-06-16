'use server';

import { sql } from '@/lib/db';

type CreateReportEntryInput = {
    task: string;
    description: string;
    duration: string;
    amount: number;
    date: string;
};

export async function createReportEntry(
    data: CreateReportEntryInput
) {
    try {
        await sql`
            INSERT INTO report_entries (
                task,
                description,
                duration,
                amount,
                date
            )
            VALUES (
                ${data.task},
                ${data.description},
                ${data.duration},
                ${data.amount},
                ${data.date}
            )
        `;

        return {
            success: true,
        };
    } catch (error) {
        console.error(error);

        return {
            success: false,
            message: 'Erro ao salvar registro',
        };
    }
}

export async function getReportEntries() {
    const entries = await sql`
        SELECT *
        FROM report_entries
        ORDER BY date DESC
    `;

    return entries;
}