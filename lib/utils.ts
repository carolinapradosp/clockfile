export default function formatCurrency({
    value,
    currency,
}: {
    value: number;
    currency: string;
}): string {
    try {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency,
        }).format(value);
    } catch {
        return `${currency} ${value.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }
}