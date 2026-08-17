// interfaces/Dashboard.ts

export type DashboardCurrencyTotal = {
    currency: string;
    amount: number;
};

export type DashboardRecentReportEntry = {
    type: 'report-entry';

    id: string;
    projectId: string;
    projectName: string;

    title: string;
    description: string;

    date: string;
    durationMinutes: number;

    amount: number;
    currency: string;

    createdAt: string;
};

export type DashboardRecentInvoice = {
    type: 'invoice';

    id: string;
    projectId: string | null;
    projectName: string | null;

    invoiceNumber: string;

    recipientName: string | null;

    status: 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'cancelled';

    totalAmount: number;
    currency: string;

    date: string;
    createdAt: string;
};

export type DashboardRecentActivity = DashboardRecentReportEntry | DashboardRecentInvoice;

export type DashboardData = {
    activeProjects: number;

    currentMonth: {
        totalEntries: number;
        totalMinutes: number;

        generatedAmounts: DashboardCurrencyTotal[];
    };

    openInvoices: {
        count: number;
        totals: DashboardCurrencyTotal[];
    };

    recentActivity: DashboardRecentActivity[];
};
