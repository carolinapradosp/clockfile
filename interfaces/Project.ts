// interfaces/Project.ts

export type ProjectStatus =
    | 'draft'
    | 'active'
    | 'paused'
    | 'completed'
    | 'archived';

export type ProjectBillingDetails = {
    name: string | null;
    company: string | null;
    email: string | null;
    phone: string | null;

    addressLine1: string | null;
    addressLine2: string | null;

    city: string | null;
    state: string | null;
    postalCode: string | null;
    countryCode: string | null;
};

export type Project = {
    id: string;
    ownerId: string;

    name: string;
    description: string | null;

    defaultHourlyRate: number | null;
    currency: string;

    status: ProjectStatus;

    startDate: string | null;
    endDate: string | null;

    billing: ProjectBillingDetails;

    createdAt: string;
    updatedAt: string;
};

export type ProjectFormData = {
    name: string;
    description: string;

    defaultHourlyRate: string;
    currency: string;

    status: ProjectStatus;

    startDate: string;
    endDate: string;

    billingName: string;
    billingCompany: string;
    billingEmail: string;
    billingPhone: string;

    billingAddressLine1: string;
    billingAddressLine2: string;

    billingCity: string;
    billingState: string;
    billingPostalCode: string;
    billingCountryCode: string;
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
              Record<
                  keyof ProjectFormData,
                  string
              >
          >;
      }
    | null;