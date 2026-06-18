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
            className="text-slate-500 appearance-none"
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