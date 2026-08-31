import Skeleton from '@/components/ui/Skeleton';
import InvoiceFormSkeleton from '@/components/invoices/InvoiceFormSkeleton';

export default function EditInvoiceLoading() {
    return (
        <div className="mx-auto max-w-6xl">
            <Skeleton className="mb-6 h-5 w-36" />

            <header className="mb-8">
                <Skeleton className="h-9 w-56" />
                <Skeleton className="mt-3 h-4 w-80 max-w-full" />
            </header>

            <InvoiceFormSkeleton />
        </div>
    );
}
