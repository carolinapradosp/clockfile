// interfaces/Invoice.ts

export type InvoiceStatus =
  | 'draft'
  | 'issued'
  | 'sent'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export type InvoiceItemSource =
  | 'monthly-report'
  | 'manual'
  | 'expense'
  | 'adjustment';

export type InvoiceItem = {
  id: string;

  description: string;
  link: string;

  quantity: string;
  rate: string;
  amount: string;

  source: InvoiceItemSource;

  /*
   * Lançamentos que deram origem ao item.
   * Normalmente usado pelo item consolidado
   * gerado a partir do relatório mensal.
   */
  reportEntryIds: string[];
};

export type InvoiceItemInput = {
  description: string;
  link: string | null;

  quantity: number | null;
  rate: number | null;
  amount: number;

  source: InvoiceItemSource;
  position: number;

  reportEntryIds: string[];
};

export type Invoice = {
  id: string;
  invoiceNumber: string;

  clientId: string | null;
  clientName: string | null;
  clientCompanyName: string | null;

  projectId: string | null;
  projectName: string | null;

  referenceMonth: string;

  invoiceDate: string;
  dueDate: string | null;

  currency: string;

  taxPercentage: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;

  status: InvoiceStatus;
  notes: string | null;

  billTo: {
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

  issuedAt: string | null;
  sentAt: string | null;
  paidAt: string | null;
  cancelledAt: string | null;

  createdAt: string;
  updatedAt: string;

  items: SavedInvoiceItem[];
};

export type InvoiceSummary = Omit<
  Invoice,
  'billTo' | 'items'
>;

export type SavedInvoiceItem = {
  id: string;

  description: string;
  link: string | null;

  quantity: number | null;
  rate: number | null;
  amount: number;

  source: InvoiceItemSource;
  position: number;

  reportEntryIds: string[];
};

export type InvoiceClientOption = {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
  currency: string | null;
};

export type InvoiceProjectOption = {
  id: string;
  clientId: string;

  name: string;
  clientName: string;
  clientCompanyName: string | null;

  defaultHourlyRate: number | null;
  currency: string;
};

export type InvoiceReportEntryOption = {
  id: string;

  projectId: string;
  task: string;
  description: string;

  date: string;

  duration: string;
  durationMinutes: number;

  rate: number | null;
  amount: number;
  currency: string;
};

export type SaveInvoiceInput = {
  invoiceId?: string;

  clientId: string;
  projectId: string | null;

  referenceMonth: string;

  invoiceDate: string;
  dueDate: string | null;

  currency: string;
  taxPercentage: number;

  notes: string | null;

  status: InvoiceStatus;

  items: InvoiceItemInput[];
};

export type SaveInvoiceResult =
  | {
      success: true;
      invoiceId: string;
      invoiceNumber: string;
    }
  | {
      success: false;
      message: string;
      code?: string;
    };

export type InvoiceStatusResult = {
  success: boolean;
  message: string;
};

export type InvoiceFilters = {
  clientId?: string;
  projectId?: string;
  status?: InvoiceStatus;
  month?: string;
};