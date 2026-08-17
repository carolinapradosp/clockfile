// lib/countries.ts

export const COUNTRIES = [
    {
        value: 'BR',
        label: 'Brasil',
    },
    {
        value: 'US',
        label: 'Estados Unidos',
    },
    {
        value: 'PT',
        label: 'Portugal',
    },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]['value'];

export function isValidCountryCode(value: string): value is CountryCode {
    return COUNTRIES.some((country) => country.value === value);
}
