import { Suspense } from 'react';

import InvoiceDetailsContent from '@/components/invoices/InvoiceDetailsContent';
import InvoiceDetailsSkeleton from '@/components/invoices/InvoiceDetailsSkeleton';

type InvoiceDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function InvoiceDetailsPage({
    params,
}: InvoiceDetailsPageProps) {
    const { id } = await params;

    return (
        <Suspense fallback={<InvoiceDetailsSkeleton />}>
            <InvoiceDetailsContent id={id} />
        </Suspense>
    );
}