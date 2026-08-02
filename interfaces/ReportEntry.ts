// interfaces/ReportEntry.ts

export type ReportEntry = {
  id: string;

  projectId: string;
  projectName: string;

  task: string;
  description: string;

  date: string;

  duration: string;
  durationMinutes: number;

  rate: number | null;
  amount: number;

  currency: string;

  createdAt: string;
  updatedAt: string;
};

export type ReportEntryFormData = {
  projectId: string;
  task: string;
  description: string;
  date: string;
  duration: string;
  rate: string;
};

export type ReportEntryActionState =
  | {
      success: true;
      message: string;
      entryId: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<
        Record<
          keyof ReportEntryFormData,
          string
        >
      >;
    }
  | null;

export type ReportProjectOption = {
  id: string;
  name: string;

  defaultHourlyRate: number | null;
  currency: string;
};