import MonthSelect from '@/components/MonthSelect';
import { getReportEntries } from '@/app/actions/report';
import TableTask from '@/components/TableTask';
import { TaskItem } from '@/interfaces/TaskItem';
import Logo from '@/components/Logo';

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
        <main className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-7xl">

                <div className="mb-2 flex items-center justify-between">
                    <div className="flex gap-4 items-center justify-between flex-col md:flex-row w-full">
                        <Logo />
                        <div className="flex items-end flex-col w-full">
                            <h1 className="lg:text-3xl text-2xl font-light text-slate-700 tracking-wide uppercase">
                                Detailed Report
                            </h1>

                            <p className="mt-2">
                                <MonthSelect
                                    value={selectedMonth}
                                    months={availableMonths}
                                />
                            </p>
                        </div>

                    </div>
                </div>

                {/* SUMMARY */}

                <div className="mt-8 flex items-center gap-8 justify-end">
                    <p className="text-sm text-gray-600">
                        Total hours:  <span className="text-xl text-black">{formatDuration(
                            totalMinutes
                        )}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                        Amount: <span className="text-xl text-black text-nowrap">
                            $ {totalAmount.toFixed(2)}
                        </span>
                    </p>
                </div>

                <TableTask items={items as TaskItem[]} />
            </div>
        </main>
    );
}