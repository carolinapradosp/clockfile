'use client';

type TextFieldProps = {
    id: string;
    name: string;
    label: string;

    type?: React.HTMLInputTypeAttribute;

    value?: string;
    defaultValue?: string;

    placeholder?: string;
    autoComplete?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];

    required?: boolean;
    disabled?: boolean;

    minLength?: number;
    maxLength?: number;

    error?: string;

    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const inputClassName = `
    h-12
    w-full
    rounded-xl
    border
    border-slate-200
    bg-white
    px-4
    text-sm
    text-slate-900
    outline-none
    transition-all
    placeholder:text-slate-400
    focus:border-blue-500
    focus:ring-4
    focus:ring-blue-500/10
    disabled:cursor-not-allowed
    disabled:bg-slate-100
    disabled:text-slate-500
`;

export default function TextField({
    id,
    name,
    label,

    type = 'text',

    value,
    defaultValue,

    placeholder,
    autoComplete,
    inputMode,

    required = false,
    disabled = false,

    minLength,
    maxLength,

    error,

    onChange,
}: TextFieldProps) {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">
                {label}

                {required && ' *'}
            </label>

            <input
                id={id}
                name={name}
                type={type}
                value={value}
                defaultValue={defaultValue}
                placeholder={placeholder}
                autoComplete={autoComplete}
                inputMode={inputMode}
                required={required}
                disabled={disabled}
                minLength={minLength}
                maxLength={maxLength}
                onChange={onChange}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                className={inputClassName}
            />

            {error && (
                <p
                    id={`${id}-error`}
                    role="alert"
                    className="mt-2 text-sm font-medium text-red-600"
                >
                    {error}
                </p>
            )}
        </div>
    );
}
