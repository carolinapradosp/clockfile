
import Logo from '@/components/Logo';

const invoiceData = {
    invoiceNumber: "14",
    date: "June 30, 2026",
    billTo: {
        name: "Andrew Sherman",
        company: "STUDIO 27 LLC",
        address: "370 NE 80TH TERRACE",
        suite: "SUITE 108",
        cityStateZip: "MIAMI FL 33138"
    },
    items: [
        {
            id: 1,
            description: "Wordpress development. Adjustments to the",
            link: "www.studiotwentyseven.com",
            quantity: 42.5,
            rate: 25.00,
            amount: 1062.50
        },
        {
            id: 2,
            description: "Plugin - Advanced Custom Fields PRO",
            link: "www.studiotwentyseven.com",
            quantity: 1,
            rate: null,
            amount: 49.00
        }
    ],
    taxPercentage: 0
};

export default function InvoiceGenerator() {
    // Formatos de moeda auxiliares
    // const formatCurrency = (value: number) => {
    //     return new Intl.NumberFormat('en-US', {
    //         style: 'currency',
    //         currency: 'USD'
    //     }).format(value);
    // };

    const subtotal = invoiceData.items.reduce((acc, item) => acc + item.amount, 0);
    const taxAmount = (subtotal * invoiceData.taxPercentage) / 100;
    const total = subtotal + taxAmount;

    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-12">
                    <div className="flex items-center gap-4">
                        <Logo />
                    </div>
                    <div className="text-left md:text-right">
                        <h1 className="lg:text-3xl text-2xl font-light text-slate-700 tracking-wide uppercase">
                            Invoice
                        </h1>
                        <span className="text-slate-500 font-medium text-lg block mt-1">
                            # {invoiceData.invoiceNumber}
                        </span>
                    </div>
                </div>

                {/* Info de Faturamento & Datas */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                    {/* Bill To */}
                    <div>
                        <span className="text-sm font-semibold text-slate-400 block mb-2">
                            Bill To:
                        </span>
                        <div className="text-slate-800 space-y-0.5">
                            <p className="font-bold">{invoiceData.billTo.name}</p>
                            <p className="text-sm">{invoiceData.billTo.company}</p>
                            <p className="text-sm">{invoiceData.billTo.address}</p>
                            <p className="text-sm">{invoiceData.billTo.suite}</p>
                            <p className="text-sm">{invoiceData.billTo.cityStateZip}</p>
                        </div>
                    </div>

                    {/* Datas e Balanço */}
                    <div className="w-full md:w-auto md:text-right flex flex-col items-end gap-2">
                        <div className="flex gap-4 text-sm">
                            <span className="text-slate-400 font-medium">Date:</span>
                            <span className="text-slate-800 font-semibold">{invoiceData.date}</span>
                        </div>

                        {/* Bloco de Destaque do Total Due */}
                        <div className="bg-slate-100/80 rounded px-2 md:px-6 py-2 flex justify-between md:justify-end items-center gap-12 w-full md:w-auto">
                            <span className="text-sm font-bold text-slate-700 text-nowrap">Balance Due:</span>
                            <span className="text-xl font-bold text-slate-900 text-nowrap">
                                $ {total.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabela de Itens (Responsiva) */}
                <div className="overflow-x-auto mb-8">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#3a3a3a] text-white text-sm font-medium">
                                <th className="p-3 rounded-l">Item</th>
                                <th className="p-3 text-right">Quantity</th>
                                <th className="p-3 text-right">Rate</th>
                                <th className="p-3 text-right rounded-r">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700 text-sm">
                            {invoiceData.items.map((item) => (
                                <tr key={item.id} className="border-b border-slate-100">
                                    <td className="p-3 max-w-xs md:max-w-none">
                                        <p className="font-bold text-slate-800">{item.description}</p>
                                        <a
                                            href={`https://${item.link}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-slate-400 hover:underline"
                                        >
                                            {item.link}
                                        </a>
                                    </td>
                                    <td className="p-3 text-right align-top text-slate-600 font-medium text-nowrap">
                                        {item.quantity}
                                    </td>
                                    <td className="p-3 text-right align-top text-slate-600 font-medium text-nowrap">
                                        {item.rate !== null ? `$ ${item.rate.toFixed(2)}` : "-"}
                                    </td>
                                    <td className="p-3 text-right align-top text-slate-800 font-semibold text-nowrap">
                                        $ {item.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totais do Rodapé */}
                <div className="flex justify-end">
                    <div className="w-full md:w-64 space-y-3 text-sm text-slate-600">
                        <div className="flex justify-between items-center px-4">
                            <span>Subtotal:</span>
                            <span className="font-medium text-slate-800">$ {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center px-4">
                            <span>Tax ({invoiceData.taxPercentage}%):</span>
                            <span className="font-medium text-slate-800">$ {taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-100 pt-3 px-4 text-base font-bold text-slate-900">
                            <span>Total:</span>
                            <span>$ {total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </main >
    );
}