'use server';

import { sql } from '@/lib/db';

export async function getReportEntries(month?: string) {
    let startDate: string;
    let endDate: string;

    if (month) {
        const [year, monthNumber] = month.split('-');

        startDate = `${year}-${monthNumber}-01`;

        const nextMonth = new Date(
            Number(year),
            Number(monthNumber),
            0
        );

        endDate = `${year}-${monthNumber}-${String(
            nextMonth.getDate()
        ).padStart(2, '0')}`;
    } else {
        const now = new Date();

        startDate = `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, '0')}-01`;

        endDate = `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, '0')}-${String(
            new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0
            ).getDate()
        ).padStart(2, '0')}`;
    }

    const entries = await sql`
        SELECT *
        FROM report_entries
        WHERE date BETWEEN ${startDate} AND ${endDate}
        ORDER BY date DESC
    `;

    return entries;
}