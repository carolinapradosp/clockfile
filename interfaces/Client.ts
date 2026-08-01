// interfaces/Client.ts

export type ClientStatus =
  | 'active'
  | 'inactive'
  | 'archived';

export type Client = {
  id: string;
  ownerId: string | null;

  name: string;
  companyName: string | null;

  email: string | null;
  phone: string | null;

  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  countryCode: string | null;

  notes: string | null;
  status: ClientStatus;

  createdAt: string;
  updatedAt: string;
};

export type ClientFormData = {
  name: string;
  companyName: string;
  email: string;
  phone: string;

  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;

  notes: string;
  status: ClientStatus;
};

export type ClientActionState =
  | {
      success: true;
      message: string;
      clientId: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<
        Record<keyof ClientFormData, string>
      >;
    }
  | null;