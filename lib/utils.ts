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


export function formatDateTime(
    value: string | null
) {
    if (!value) {
        return null;
    }

    return new Date(value).toLocaleString(
        'pt-BR',
        {
            dateStyle: 'medium',
            timeStyle: 'short',
        }
    );
}


export function formatDate(
    value: string | null
) {
    if (!value) {
        return 'Não informado';
    }

    return new Date(
        `${value}T00:00:00Z`
    ).toLocaleDateString(
        'pt-BR',
        {
            timeZone: 'UTC',
        }
    );
}

export function formatReferenceMonth(
    value: string
) {
    const [year, month] =
        value.split('-').map(Number);

    return new Date(
        Date.UTC(year, month - 1, 1)
    ).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
}


export function formatDuration(
    totalMinutes: number
): string {
    const safeMinutes =
        Number.isFinite(
            totalMinutes
        ) &&
            totalMinutes >= 0
            ? Math.floor(
                totalMinutes
            )
            : 0;

    const hours =
        Math.floor(
            safeMinutes / 60
        );

    const minutes =
        safeMinutes % 60;

    return `${String(
        hours
    ).padStart(
        2,
        '0'
    )}:${String(
        minutes
    ).padStart(
        2,
        '0'
    )}`;
}


export function isValidMonth(
    value?: string
): value is string {
    return Boolean(
        value &&
        /^\d{4}-(0[1-9]|1[0-2])$/.test(
            value
        )
    );
}