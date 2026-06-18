'use client';

import { useState } from 'react';
import { createReportEntry } from './actions/report';

type FormData = {
  task: string;
  description: string;
  date: string;
  duration: string;
};

const HOURLY_RATE = 25;
const MINIMUM_MINUTES = 30;

export default function Home() {
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

  const calculateAmount = (duration: string) => {
    if (!duration) return 0;

    const parts = duration.split(':');

    if (parts.length !== 2) return 0;

    const [hours, minutes] = parts.map(Number);

    const totalHours = hours + minutes / 60;

    return Number((totalHours * HOURLY_RATE).toFixed(2));
  };

  const getTotalMinutes = (duration: string) => {
    if (!duration) return 0;

    const parts = duration.split(':');

    if (parts.length !== 2) return 0;

    const [hours, minutes] = parts.map(Number);

    return hours * 60 + minutes;
  };

  const calculatedAmount = calculateAmount(
    formData.duration
  );

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const totalMinutes = getTotalMinutes(
      formData.duration
    );

    if (totalMinutes < MINIMUM_MINUTES) {
      alert(
        'O tempo mínimo para registro é de 30 minutos.'
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
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Meu Clockify
          </h1>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="mt-2 text-slate-500">
                Adicione uma nova atividade ao relatório
              </p>
            </div>

            <div>
              <a href="/relatorio">
                <u>Acessar relatório</u>
              </a>
            </div>
          </div>
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

            <div className="grid gap-6 md:grid-cols-2">
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
                  placeholder="01:30"
                  pattern="^([0-9]{1,2}):([0-5][0-9])$"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Formato: HH:MM (mínimo 00:30)
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="text-sm text-slate-600">
                Valor calculado automaticamente
              </div>

              <div className="mt-1 text-3xl font-bold text-green-700">
                US$ {calculatedAmount.toFixed(2)}
              </div>

              <div className="mt-1 text-xs text-slate-500">
                Taxa: US$ {HOURLY_RATE}/hora
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