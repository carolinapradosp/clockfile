import { Suspense } from 'react';

import InvoicesContent from '@/components/invoices/InvoicesContent';
import InvoicesSkeleton from '@/components/invoices/InvoicesSkeleton';

type InvoicesPageProps = {
    searchParams: Promise<{
        month?: string;
        projectId?: string;
        status?: string;
    }>;
};

export default function InvoicesPage({ searchParams }: InvoicesPageProps) {
    return (
        <Suspense fallback={<InvoicesSkeleton />}>
            <InvoicesContent searchParams={searchParams} />
        </Suspense>
    );
}