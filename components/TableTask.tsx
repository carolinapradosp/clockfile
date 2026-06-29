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
        <div className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-300 mt-10">
                    <thead className="">
                        <tr>
                            <th className="py-3 text-left text-sm font-semibold text-black">
                                Date
                            </th>

                            <th className="py-3 text-left text-sm font-semibold text-black">
                                Task
                            </th>

                            <th className="py-3 text-left text-sm font-semibold text-black">
                                Description
                            </th>

                            <th className="py-3 text-left text-sm font-semibold text-black">
                                Duration
                            </th>

                            <th className="py-3 text-right text-sm font-semibold text-black">
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
                                    <td className="py-4 text-sm text-gray-600">
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

                                    <td className="py-4 text-sm text-gray-600">
                                        {item.task}
                                    </td>

                                    <td className="py-4 text-sm text-gray-600">
                                        {
                                            item.description
                                        }
                                    </td>

                                    <td className="py-4 text-sm text-gray-600">
                                        {
                                            item.duration
                                        }
                                    </td>

                                    <td className="py-4 text-right text-sm text-gray-600">
                                        $ {Number(
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