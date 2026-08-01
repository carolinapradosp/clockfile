// interfaces/Invoice.ts

export type InvoiceItemSource =
  | 'monthly-report'
  | 'manual';

export type InvoiceItem = {
  id: string;
  description: string;
  link: string;

  quantity: string;
  rate: string;
  amount: string;

  source: InvoiceItemSource;
};

export type InvoiceInitialData = {
  invoiceId?: string;

  invoiceNumber: string;
  referenceMonth: string;
  date: string;

  billTo: {
    name: string;
    company: string;
    address: string;
    suite: string;
    cityStateZip: string;
  };

  taxPercentage: number;
  items: InvoiceItem[];
};

export type SavedInvoice = {
  id: string;
  invoiceNumber: number;
  referenceMonth: string;
  invoiceDate: string;
  taxPercentage: number;
  items: Array<{
    id: string;
    description: string;
    link: string | null;
    quantity: number | null;
    rate: number | null;
    amount: number | null;
    source: InvoiceItemSource;
  }>;
};

export type SaveInvoiceInput = {
  referenceMonth: string;
  invoiceDate: string;
  taxPercentage: number;

  items: Array<{
    description: string;
    link: string | null;
    quantity: number | null;
    rate: number | null;
    amount: number | null;
    source: InvoiceItemSource;
  }>;
};

export type SaveInvoiceResult =
  | {
      success: true;
      invoiceId: string;
      invoiceNumber: number;
    }
  | {
      success: false;
      message: string;
    };