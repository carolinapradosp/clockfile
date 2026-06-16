'use client';

import { useState } from 'react';
import { createReportEntry } from './actions/report';

type FormData = {
  task: string;
  description: string;
  date: string;
  duration: string;
  amount: string;
};

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    task: '',
    description: '',
    date: '',
    duration: '',
    amount: '',
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

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const result = await createReportEntry({
      task: formData.task,
      description: formData.description,
      duration: formData.duration,
      amount: Number(formData.amount),
      date: formData.date,
    });

    if (result.success) {
      alert('Registro salvo com sucesso!');

      setFormData({
        task: '',
        description: '',
        duration: '',
        amount: '',
        date: '',
      });
    } else {
      alert(result.message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Meu Clockify
          </h1>

          <p className="mt-2 text-slate-500">
            Adicione uma nova atividade ao relatório
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
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
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-slate-700"
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
                placeholder="Descreva a atividade realizada..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
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
                  type="text"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  placeholder="01:30:00"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                />
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Amount
                </label>

                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  placeholder="25.00"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-700"
              >
                Salvar Registro
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}