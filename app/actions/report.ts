'use server';

import { sql } from '@/lib/db';

export async function getReportEntries(month?: string) {
    const selectedMonth =
        month ||
        new Date().toISOString().slice(0, 7);

    const [year, monthNumber] =
        selectedMonth.split('-');

    const startDate = `${year}-${monthNumber}-01`;

    const lastDay = new Date(
        Number(year),
        Number(monthNumber),
        0
    ).getDate();

    const endDate = `${year}-${monthNumber}-${String(
        lastDay
    ).padStart(2, '0')}`;

    return await sql`
        SELECT *
        FROM report_entries
        WHERE date BETWEEN ${startDate} AND ${endDate}
        ORDER BY date DESC
    `;
}


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