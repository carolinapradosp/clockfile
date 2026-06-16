type ReportItem = {
    id: string;
    date: string;
    taskCode: string;
    description: string;
    duration: string;
    amount: string;
};

type ReportData = {
    date: string;
    total: string;
    amount: string;
    items: ReportItem[];
};

const reportMock: ReportData = {
    date: '01/05/2026 - 31/05/2026',
    total: '06:30:00',
    amount: '162,50 USD',
    items: [],
};

export default function Relatorio() {
    const report = reportMock;

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl">
                {/* HEADER */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Detailed Report
                    </h1>

                    <p className="mt-2 text-slate-500">
                        {report.date}
                    </p>
                </div>

                {/* SUMMARY */}
                <div className="mb-8 grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border-slate-200 border bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Total Hours
                        </p>

                        <h2 className="mt-2 text-2xl font-bold">
                            {report.total}
                        </h2>
                    </div>

                    <div className="rounded-xl border-slate-200 border bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Total Amount
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-green-600">
                            {report.amount}
                        </h2>
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border-slate-200 border bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px]">
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
                                {report.items.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-12 text-center text-slate-500"
                                        >
                                            No records found.
                                        </td>
                                    </tr>
                                ) : (
                                    report.items.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-t hover:bg-slate-50"
                                        >
                                            <td className="px-4 py-4">
                                                {item.date}
                                            </td>

                                            <td className="px-4 py-4 font-medium">
                                                {item.taskCode}
                                            </td>

                                            <td className="px-4 py-4">
                                                {item.description}
                                            </td>

                                            <td className="px-4 py-4">
                                                {item.duration}
                                            </td>

                                            <td className="px-4 py-4 text-right font-medium">
                                                {item.amount}
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