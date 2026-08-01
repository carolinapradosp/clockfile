// interfaces/ReportEntry.ts

export type ReportEntry = {
  id: string;

  projectId: string | null;
  projectName: string | null;

  clientId: string | null;
  clientName: string | null;
  clientCompanyName: string | null;

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

  clientId: string;
  clientName: string;
  clientCompanyName: string | null;

  defaultHourlyRate: number | null;
  currency: string;
};