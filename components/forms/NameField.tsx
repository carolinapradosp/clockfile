'use client';

import TextField from '@/components/forms/TextField';

type NameFieldProps = {
    id?: string;
    name?: string;
    label?: string;

    value: string;

    onChange: (value: string) => void;

    error?: string;

    required?: boolean;
    placeholder?: string;
    autoComplete?: string;
    maxLength?: number;
};

export function sanitizeName(value: string): string {
    return value.replace(/\d/g, '');
}

export function isValidName(value: string): boolean {
    const normalized = value.trim();

    return normalized.length >= 2 && !/\d/.test(normalized);
}

export default function NameField({
    id = 'name',
    name = 'name',
    label = 'Nome',

    value,
    onChange,

    error,

    required = true,
    placeholder = 'Seu nome completo',
    autoComplete = 'name',
    maxLength = 150,
}: NameFieldProps) {
    return (
        <TextField
            id={id}
            name={name}
            label={label}
            type="text"
            value={value}
            required={required}
            placeholder={placeholder}
            autoComplete={autoComplete}
            maxLength={maxLength}
            error={error}
            onChange={(event) => onChange(sanitizeName(event.target.value))}
        />
    );
}
