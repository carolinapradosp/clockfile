import InvoiceDetailsContent from '@/components/invoices/InvoiceDetailsContent';

type InvoiceDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function InvoiceDetailsPage({ params }: InvoiceDetailsPageProps) {
    const { id } = await params;

    return <InvoiceDetailsContent id={id} />;
}
