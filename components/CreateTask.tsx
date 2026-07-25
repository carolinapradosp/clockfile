"use client";
import { useState } from 'react';
import { durationToMinutes } from '@/lib/time';
import { calculateAmount } from '@/lib/billing';
import { FormData } from '@/interfaces/FormData';
import { HOURLY_RATE, MINIMUM_MINUTES } from '@/lib/constants';
import { createReportEntry } from '@/app/actions/report';

export default function CreateTask() {
    const [formData, setFormData] = useState<FormData>({
        task: '',
        description: '',
        date: '',
        duration: '',
    });
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const calculatedAmount = calculateAmount(
        formData.duration
    );
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        const totalMinutes = durationToMinutes(
            formData.duration
        );

        if (totalMinutes < MINIMUM_MINUTES) {
            alert(
                `O tempo mínimo para registro é de ${MINIMUM_MINUTES} minutos.`
            );
            return;
        }

        const result = await createReportEntry({
            task: formData.task,
            description: formData.description,
            duration: formData.duration,
            amount: calculatedAmount,
            date: formData.date,
        });

        if (result.success) {
            alert('Registro salvo com sucesso!');

            setFormData({
                task: '',
                description: '',
                duration: '',
                date: '',
            });
        } else {
            alert(result.message);
        }
    };
    return (
        <form
            onSubmit={handleSubmit}
            className=""
        >   <div className="grid gap-4 md:grid-cols-3">
                <div>
                    <label
                        htmlFor="task"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Task
                    </label>

                    <input
                        id="task"
                        name="task"
                        type="text"
                        value={formData.task}
                        onChange={handleChange}
                        placeholder="wp_0075"
                        required
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                    />
                </div>
                <div>
                    <label
                        htmlFor="date"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Date
                    </label>

                    <input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                    />
                </div>

                <div>
                    <label
                        htmlFor="duration"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Duration
                    </label>
                    <input
                        id="duration"
                        name="duration"
                        type="time"
                        value={formData.duration}
                        onChange={handleChange}
                        required
                        placeholder="01:30"
                        pattern="^([0-9]{1,2}):([0-5][0-9])$"
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                        Format: HH:MM (minimum 00:30)
                    </p>
                </div>
            </div>


            <div>
                <label
                    htmlFor="description"
                    className="mt-4 mb-2 block text-sm font-medium text-slate-700"
                >
                    Description
                </label>

                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    required
                    placeholder="Describe the activity performed..."
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                />
            </div>



            <div className="rounded-lg border border-green-200 bg-green-50 p-4 my-4">
                <div className="text-sm text-slate-600">
                    Value calculated automatically
                </div>

                <div className="mt-1 text-3xl font-bold text-green-700">
                    $ {calculatedAmount.toFixed(2)}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                    Rate: $ {HOURLY_RATE}/hour
                </div>
            </div>

            <div className="flex justify-start">
                <button
                    type="submit"
                    className="cursor-pointer rounded-xl bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2  disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Save
                </button>
            </div>
        </form>
    )
}