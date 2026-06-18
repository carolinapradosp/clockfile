import MonthSelect from '@/components/MonthSelect';
import { getReportEntries } from '@/app/actions/report';
import Link from 'next/link';
import TableTask from '@/components/TableTask';
import { TaskItem } from '@/interfaces/TaskItem';

type PageProps = {
    searchParams: Promise<{
        month?: string;
    }>;
};

export default async function Relatorio({
    searchParams,
}: PageProps) {
    const params = await searchParams;

    const selectedMonth =
        params.month ||
        new Date().toISOString().slice(0, 7);

    const items = await getReportEntries(selectedMonth);

    const totalAmount = items.reduce(
        (acc, item) => acc + Number(item.amount || 0),
        0
    );

    const totalMinutes = items.reduce(
        (acc, item) => {
            if (!item.duration) return acc;

            const [hours, minutes] = item.duration
                .split(':')
                .map(Number);

            return acc + hours * 60 + minutes;
        },
        0
    );

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        return `${String(hours).padStart(
            2,
            '0'
        )}:${String(remainingMinutes).padStart(
            2,
            '0'
        )}`;
    };

    const now = new Date();
    const currentYear = now.getFullYear();

    const availableMonths = Array.from(
        { length: 12 },
        (_, index) => {
            const date = new Date(
                currentYear,
                index,
                1
            );

            return {
                value: `${currentYear}-${String(
                    index + 1
                ).padStart(2, '0')}`,
                label: date.toLocaleDateString(
                    'en-US',
                    {
                        month: 'long',
                        year: 'numeric',
                    }
                ),
            };
        }
    );

    return (
        <main className="min-h-screen p-8">
            <div className="mx-auto max-w-7xl">
                {/* HEADER */}

                <div className="mb-2 flex items-center justify-between">
                    <div>
                        <Link href="/" className="text-3xl font-bold text-slate-900">
                            Detailed Report
                        </Link>

                        {/* <p className="mt-2 text-slate-500">
                            {availableMonths.find(
                                (m) =>
                                    m.value === selectedMonth
                            )?.label}
                        </p> */}
                        <p className="mt-2">
                            <MonthSelect
                                value={selectedMonth}
                                months={availableMonths}
                            />
                        </p>

                    </div>


                </div>

                {/* SUMMARY */}

                <div className="mb-4 flex items-center gap-8">
                    <p className="text-sm text-gray-600">
                        Total:  <span className="text-xl text-black">{formatDuration(
                            totalMinutes
                        )}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                        Amount: <span className="text-xl text-black">
                            {totalAmount.toFixed(2)} USD
                        </span>
                    </p>
                </div>

                <TableTask items={items as TaskItem[]} />
            </div>
        </main>
    );
}