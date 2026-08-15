'use client';

import TextField from '@/components/forms/TextField';

type EmailFieldProps = {
    id?: string;
    name?: string;
    label?: string;

    value?: string;
    defaultValue?: string;

    onChange?: (
        value: string
    ) => void;

    error?: string;

    required?: boolean;
};

export function isValidEmail(
    value: string
): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        value.trim()
    );
}

export default function EmailField({
    id = 'email',
    name = 'email',
    label = 'E-mail',

    value,
    defaultValue,

    onChange,

    error,

    required = true,
}: EmailFieldProps) {
    return (
        <TextField
            id={id}
            name={name}
            label={label}
            type="email"
            value={value}
            defaultValue={defaultValue}
            required={required}
            autoComplete="email"
            maxLength={255}
            placeholder="voce@exemplo.com"
            error={error}
            onChange={
                onChange
                    ? (event) =>
                        onChange(
                            event.target.value
                        )
                    : undefined
            }
        />
    );
}