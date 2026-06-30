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
            <div className="overflow-x-auto my-12">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-black text-white text-sm font-medium">
                            <th className="p-3 rounded-l">
                                Date
                            </th>

                            <th className="p-3 text-left">
                                Task
                            </th>

                            <th className="p-3 text-left">
                                Description
                            </th>

                            <th className="p-3 text-right">
                                Duration
                            </th>

                            <th className="p-3 text-right rounded-r">
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
                                    <td className="p-3 text-sm text-gray-600">
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

                                    <td className="p-3 text-sm text-gray-600">
                                        {item.task}
                                    </td>

                                    <td className="p-3 text-sm text-gray-600">
                                        {
                                            item.description
                                        }
                                    </td>

                                    <td className="p-3 text-sm text-gray-600 text-right">
                                        {
                                            item.duration
                                        }
                                    </td>

                                    <td className="p-3 text-right text-sm text-gray-600">
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