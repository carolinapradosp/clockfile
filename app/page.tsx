import Link from 'next/link';
import { getReportEntries } from '@/app/actions/report';
import MonthSelect from '@/components/MonthSelect';

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

  const items = await getReportEntries(
    selectedMonth
  );

  const totalAmount = items.reduce(
    (acc, item) => acc + Number(item.amount || 0),
    0
  );

  const totalDuration = items.reduce(
    (acc, item) => {
      if (!item.duration) {
        return acc;
      }

      const parts = item.duration.split(':');

      const hours = Number(parts[0] || 0);
      const minutes = Number(parts[1] || 0);
      const seconds = Number(parts[2] || 0);

      return (
        acc +
        hours * 3600 +
        minutes * 60 +
        seconds
      );
    },
    0
  );

  const formatDuration = (totalSeconds: number) => {
    if (!totalSeconds || Number.isNaN(totalSeconds)) {
      return '00:00:00';
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(
      2,
      '0'
    )}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`;
  };

  const currentDate = new Date(
    `${selectedMonth}-01`
  );

  const previousMonth = new Date(currentDate);
  previousMonth.setMonth(
    previousMonth.getMonth() - 1
  );

  const nextMonth = new Date(currentDate);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const now = new Date();

  const availableMonths = [];

  for (let i = 0; i < 24; i++) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    availableMonths.push({
      value: date.toISOString().slice(0, 7),
      label: date.toLocaleDateString(
        'pt-BR',
        {
          month: 'long',
          year: 'numeric',
        }
      ),
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Detailed Report
            </h1>

            <p className="mt-2 text-slate-500">
              {selectedMonth}
            </p>
          </div>

          <MonthSelect
            value={selectedMonth}
            months={availableMonths}
          />
        </div>

        {/* SUMMARY */}

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Hours
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {formatDuration(
                totalDuration
              )}
            </h2>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Amount
            </p>

            <h2 className="mt-2 text-2xl font-bold text-green-600">
              USD {totalAmount.toFixed(2)}
            </h2>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Task
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Description
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Duration
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-slate-500"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        {new Date(
                          item.date
                        ).toLocaleDateString(
                          'pt-BR'
                        )}
                      </td>

                      <td className="px-4 py-4 font-medium">
                        {item.task}
                      </td>

                      <td className="px-4 py-4">
                        {
                          item.description
                        }
                      </td>

                      <td className="px-4 py-4">
                        {
                          item.duration
                        }
                      </td>

                      <td className="px-4 py-4 text-right font-medium">
                        USD{' '}
                        {Number(
                          item.amount
                        ).toFixed(
                          2
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}