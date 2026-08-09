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

export const VALID_CURRENCIES = [
  'BRL',
  'USD',
  'EUR',
] as const;

type ValidCurrency =
  typeof VALID_CURRENCIES[number];

export function isValidCurrency(
  value: string
): value is ValidCurrency {
  return VALID_CURRENCIES.includes(
    value as ValidCurrency
  );
}

