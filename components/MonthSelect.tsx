'use client';

import { useRouter } from 'next/navigation';

type Props = {
    value: string;
    months: {
        value: string;
        label: string;
    }[];
};

export default function MonthSelect({
    value,
    months,
}: Props) {
    const router = useRouter();

    return (
        <select
            value={value}
            onChange={(e) =>
                router.push(
                    `/relatorio?month=${e.target.value}`
                )
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-2"
        >
            {months.map((month) => (
                <option
                    key={month.value}
                    value={month.value}
                >
                    {month.label}
                </option>
            ))}
        </select>
    );
}