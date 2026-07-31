// interfaces/Invoice.ts

export type InvoiceItem = {
  id: string;

  description: string;
  link: string;

  /*
   * Usamos string no formulário para permitir
   * campos vazios durante a digitação.
   */
  quantity: string;
  rate: string;
  amount: string;

  source: 'monthly-report' | 'manual';
};

export type InvoiceInitialData = {
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