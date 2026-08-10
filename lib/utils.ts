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

export function isValidEmail(
  value: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

export function isValidPhone(
  value: string
): boolean {
  const digits = value.replace(/\D/g, '');

  return (
    digits.length >= 8 &&
    digits.length <= 15
  );
}


export function formatPhone(
    value: string
): string {
    const digits = value
        .replace(/\D/g, '')
        .slice(0, 11);

    if (!digits) {
        return '';
    }

    if (digits.length <= 2) {
        return `(${digits}`;
    }

    const areaCode =
        digits.slice(0, 2);

    const number =
        digits.slice(2);

    if (number.length <= 4) {
        return `(${areaCode}) ${number}`;
    }

    if (number.length <= 8) {
        return `(${areaCode}) ${number.slice(
            0,
            4
        )}-${number.slice(4)}`;
    }

    return `(${areaCode}) ${number.slice(
        0,
        5
    )}-${number.slice(5)}`;
}


export function sanitizeName(
    value: string
): string {
    return value.replace(
        /\d/g,
        ''
    );
}


export function isValidUuid(
  value: string
): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}


export function isValidDate(
  value: string
): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return false;
  }

  const date = new Date(
    `${value}T00:00:00Z`
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return false;
  }

  return (
    date
      .toISOString()
      .slice(0, 10) === value
  );
}