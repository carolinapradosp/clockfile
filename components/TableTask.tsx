import { TaskItem } from '@/interfaces/TaskItem';

type TableTaskProps = {
    items: TaskItem[];
};

export default function TableTask({
    items,
}: TableTaskProps) {

    const sortedItems = [...items].sort((a, b) => {
        const taskANumber = Number(
            a.task.match(/\d+/)?.[0] || 0
        );

        const taskBNumber = Number(
            b.task.match(/\d+/)?.[0] || 0
        );

        return taskBNumber - taskANumber;
    });


    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-300">
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
                        {sortedItems.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="py-12 text-center text-slate-500"
                                >
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            sortedItems.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-t border-gray-200"
                                >
                                    <td className="px-4 py-4">
                                        {new Date(
                                            item.date
                                        ).toLocaleDateString(
                                            'en-US',
                                            {
                                                timeZone:
                                                    'UTC',
                                            }
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
    );
}