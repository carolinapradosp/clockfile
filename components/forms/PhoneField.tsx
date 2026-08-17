'use client';

import TextField from '@/components/forms/TextField';

type PhoneFieldProps = {
    id?: string;
    name?: string;
    label?: string;

    value: string;

    onChange: (value: string) => void;

    error?: string;

    required?: boolean;
};

export function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (!digits) {
        return '';
    }

    if (digits.length <= 2) {
        return `(${digits}`;
    }

    const areaCode = digits.slice(0, 2);

    const number = digits.slice(2);

    if (number.length <= 4) {
        return `(${areaCode}) ${number}`;
    }

    if (number.length <= 8) {
        return `(${areaCode}) ${number.slice(0, 4)}-${number.slice(4)}`;
    }

    return `(${areaCode}) ${number.slice(0, 5)}-${number.slice(5)}`;
}

export function isValidPhone(value: string): boolean {
    const digits = value.replace(/\D/g, '');

    return digits.length === 10 || digits.length === 11;
}

export default function PhoneField({
    id = 'phone',
    name = 'phone',
    label = 'Telefone',

    value,
    onChange,

    error,

    required = true,
}: PhoneFieldProps) {
    return (
        <TextField
            id={id}
            name={name}
            label={label}
            type="tel"
            value={value}
            required={required}
            inputMode="tel"
            autoComplete="tel"
            maxLength={15}
            placeholder="(11) 99999-9999"
            error={error}
            onChange={(event) => onChange(formatPhone(event.target.value))}
        />
    );
}
