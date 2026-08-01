// interfaces/Project.ts

export type ProjectStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'archived';

export type Project = {
  id: string;

  clientId: string;
  clientName: string;
  clientCompanyName: string | null;

  name: string;
  description: string | null;

  defaultHourlyRate: number | null;
  currency: string;

  status: ProjectStatus;

  startDate: string | null;
  endDate: string | null;

  createdAt: string;
  updatedAt: string;
};

export type ProjectFormData = {
  clientId: string;

  name: string;
  description: string;

  defaultHourlyRate: string;
  currency: string;

  status: ProjectStatus;

  startDate: string;
  endDate: string;
};

export type ProjectActionState =
  | {
      success: true;
      message: string;
      projectId: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<
        Record<keyof ProjectFormData, string>
      >;
    }
  | null;