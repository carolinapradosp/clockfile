'use client';

import TextField from '@/components/forms/TextField';

import {
    COUNTRIES,
} from '@/lib/countries';

import {
    inputClassNameNoIcon,
} from '@/lib/utils';

export type AddressFieldKey =
    | 'addressLine1'
    | 'addressLine2'
    | 'city'
    | 'state'
    | 'postalCode'
    | 'countryCode';

export type AddressValues = Record<
    AddressFieldKey,
    string
>;

type AddressFieldsProps = {
    /*
     * Use values + onChange para
     * formulário controlado.
     */
    values?: Partial<AddressValues>;

    /*
     * Use defaultValues para formulário
     * enviado diretamente por Server Action.
     */
    defaultValues?: Partial<AddressValues>;

    onChange?: (
        field: AddressFieldKey,
        value: string
    ) => void;

    /*
     * Permite utilizar os nomes esperados
     * por diferentes Server Actions.
     */
    names?: Partial<
        Record<
            AddressFieldKey,
            string
        >
    >;

    ids?: Partial<
        Record<
            AddressFieldKey,
            string
        >
    >;

    errors?: Partial<
        Record<
            AddressFieldKey,
            string | undefined
        >
    >;

    countryRequired?: boolean;
};

const DEFAULT_NAMES: Record<
    AddressFieldKey,
    string
> = {
    addressLine1:
        'addressLine1',

    addressLine2:
        'addressLine2',

    city:
        'city',

    state:
        'state',

    postalCode:
        'postalCode',

    countryCode:
        'countryCode',
};

const DEFAULT_IDS =
    DEFAULT_NAMES;

export default function AddressFields({
    values,
    defaultValues,
    onChange,
    names = {},
    ids = {},
    errors = {},
    countryRequired = false,
}: AddressFieldsProps) {
    const controlled =
        values !== undefined;

    function getValue(
        field: AddressFieldKey
    ) {
        return controlled
            ? values?.[field] ?? ''
            : undefined;
    }

    function getDefaultValue(
        field: AddressFieldKey
    ) {
        return controlled
            ? undefined
            : defaultValues?.[
            field
            ] ?? '';
    }

    function change(
        field: AddressFieldKey,
        value: string
    ) {
        onChange?.(
            field,
            value
        );
    }

    function getName(
        field: AddressFieldKey
    ) {
        return (
            names[field] ??
            DEFAULT_NAMES[field]
        );
    }

    function getId(
        field: AddressFieldKey
    ) {
        return (
            ids[field] ??
            DEFAULT_IDS[field]
        );
    }

    return (
        <>
            {/* ENDEREÇO */}

            <div className="md:col-span-2">
                <TextField
                    id={getId(
                        'addressLine1'
                    )}
                    name={getName(
                        'addressLine1'
                    )}
                    label="Endereço"
                    type="text"
                    value={getValue(
                        'addressLine1'
                    )}
                    defaultValue={
                        getDefaultValue(
                            'addressLine1'
                        )
                    }
                    maxLength={255}
                    placeholder="Rua, número e endereço principal"
                    error={
                        errors.addressLine1
                    }
                    onChange={
                        controlled
                            ? (event) =>
                                change(
                                    'addressLine1',
                                    event.target.value
                                )
                            : undefined
                    }
                />
            </div>

            {/* COMPLEMENTO */}

            <div className="md:col-span-2">
                <TextField
                    id={getId(
                        'addressLine2'
                    )}
                    name={getName(
                        'addressLine2'
                    )}
                    label="Complemento"
                    type="text"
                    value={getValue(
                        'addressLine2'
                    )}
                    defaultValue={
                        getDefaultValue(
                            'addressLine2'
                        )
                    }
                    maxLength={255}
                    placeholder="Sala, apartamento ou complemento"
                    error={
                        errors.addressLine2
                    }
                    onChange={
                        controlled
                            ? (event) =>
                                change(
                                    'addressLine2',
                                    event.target.value
                                )
                            : undefined
                    }
                />
            </div>

            {/* CIDADE */}

            <TextField
                id={getId('city')}
                name={getName('city')}
                label="Cidade"
                type="text"
                value={
                    getValue('city')
                }
                defaultValue={
                    getDefaultValue(
                        'city'
                    )
                }
                maxLength={150}
                error={errors.city}
                onChange={
                    controlled
                        ? (event) =>
                            change(
                                'city',
                                event.target.value
                            )
                        : undefined
                }
            />

            {/* ESTADO */}

            <TextField
                id={getId('state')}
                name={getName('state')}
                label="Estado"
                type="text"
                value={
                    getValue('state')
                }
                defaultValue={
                    getDefaultValue(
                        'state'
                    )
                }
                maxLength={100}
                error={errors.state}
                onChange={
                    controlled
                        ? (event) =>
                            change(
                                'state',
                                event.target.value
                            )
                        : undefined
                }
            />

            {/* CEP */}

            <TextField
                id={getId(
                    'postalCode'
                )}
                name={getName(
                    'postalCode'
                )}
                label="CEP / Código postal"
                type="text"
                value={
                    getValue(
                        'postalCode'
                    )
                }
                defaultValue={
                    getDefaultValue(
                        'postalCode'
                    )
                }
                maxLength={30}
                error={
                    errors.postalCode
                }
                onChange={
                    controlled
                        ? (event) =>
                            change(
                                'postalCode',
                                event.target.value
                            )
                        : undefined
                }
            />

            {/* PAÍS */}

            <div>
                <label
                    htmlFor={getId(
                        'countryCode'
                    )}
                    className="mb-2 block text-sm font-semibold text-slate-700"
                >
                    País

                    {countryRequired
                        ? ' *'
                        : ''}
                </label>

                <select
                    id={getId(
                        'countryCode'
                    )}
                    name={getName(
                        'countryCode'
                    )}
                    required={
                        countryRequired
                    }
                    value={
                        controlled
                            ? (
                                values
                                    ?.countryCode ??
                                ''
                            )
                            : undefined
                    }
                    defaultValue={
                        controlled
                            ? undefined
                            : (
                                defaultValues
                                    ?.countryCode ??
                                ''
                            )
                    }
                    onChange={
                        controlled
                            ? (event) =>
                                change(
                                    'countryCode',
                                    event.target.value
                                )
                            : undefined
                    }
                    aria-invalid={
                        Boolean(
                            errors.countryCode
                        )
                    }
                    className={
                        inputClassNameNoIcon
                    }
                >
                    <option value="">
                        Selecione o país
                    </option>

                    {COUNTRIES.map(
                        (country) => (
                            <option
                                key={
                                    country.value
                                }
                                value={
                                    country.value
                                }
                            >
                                {
                                    country.label
                                }
                            </option>
                        )
                    )}
                </select>

                {errors.countryCode && (
                    <p
                        role="alert"
                        className="mt-2 text-sm font-medium text-red-600"
                    >
                        {
                            errors.countryCode
                        }
                    </p>
                )}
            </div>
        </>
    );
}