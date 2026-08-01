// app/actions/clients.ts

'use server';

import { revalidatePath } from 'next/cache';

import { sql } from '@/lib/db';
import { getCurrentAppUserId } from '@/lib/users/get-current-app-user';

import type {
  Client,
  ClientActionState,
  ClientFormData,
  ClientStatus,
} from '@/interfaces/Client';

type ClientRow = {
  id: string;
  owner_id: string | null;

  name: string;
  company_name: string | null;

  email: string | null;
  phone: string | null;

  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country_code: string | null;

  notes: string | null;
  status: ClientStatus;

  created_at: string | Date;
  updated_at: string | Date;
};

const VALID_STATUSES: ClientStatus[] = [
  'active',
  'inactive',
  'archived',
];

function normalizeDate(
  value: string | Date
): string {
  return value instanceof Date
    ? value.toISOString()
    : String(value);
}

function mapClientRow(
  row: ClientRow
): Client {
  return {
    id: String(row.id),
    ownerId: row.owner_id
      ? String(row.owner_id)
      : null,

    name: row.name,
    companyName: row.company_name,

    email: row.email,
    phone: row.phone,

    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    countryCode: row.country_code,

    notes: row.notes,
    status: row.status,

    createdAt: normalizeDate(
      row.created_at
    ),

    updatedAt: normalizeDate(
      row.updated_at
    ),
  };
}

function optionalText(
  value: FormDataEntryValue | null
): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  return normalized || null;
}

function requiredText(
  value: FormDataEntryValue | null
): string {
  return typeof value === 'string'
    ? value.trim()
    : '';
}

function isValidEmail(
  email: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

function isValidUuid(
  value: string
): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function parseClientFormData(
  formData: FormData
):
  | {
      success: true;
      data: ClientFormData;
    }
  | {
      success: false;
      result: ClientActionState;
    } {
  const name = requiredText(
    formData.get('name')
  );

  const companyName =
    requiredText(
      formData.get('companyName')
    );

  const email = requiredText(
    formData.get('email')
  );

  const phone = requiredText(
    formData.get('phone')
  );

  const addressLine1 =
    requiredText(
      formData.get('addressLine1')
    );

  const addressLine2 =
    requiredText(
      formData.get('addressLine2')
    );

  const city = requiredText(
    formData.get('city')
  );

  const state = requiredText(
    formData.get('state')
  );

  const postalCode =
    requiredText(
      formData.get('postalCode')
    );

  const countryCode =
    requiredText(
      formData.get('countryCode')
    ).toUpperCase();

  const notes = requiredText(
    formData.get('notes')
  );

  const rawStatus =
    requiredText(
      formData.get('status')
    ) as ClientStatus;

  const status =
    VALID_STATUSES.includes(rawStatus)
      ? rawStatus
      : 'active';

  const fieldErrors: Partial<
    Record<keyof ClientFormData, string>
  > = {};

  if (!name) {
    fieldErrors.name =
      'Informe o nome do cliente.';
  }

  if (email && !isValidEmail(email)) {
    fieldErrors.email =
      'Informe um e-mail válido.';
  }

  if (
    countryCode &&
    countryCode.length !== 2
  ) {
    fieldErrors.countryCode =
      'Use o código do país com 2 letras.';
  }

  if (
    Object.keys(fieldErrors).length > 0
  ) {
    return {
      success: false,
      result: {
        success: false,
        message:
          'Revise os campos destacados.',
        fieldErrors,
      },
    };
  }

  return {
    success: true,
    data: {
      name,
      companyName,
      email,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      countryCode,
      notes,
      status,
    },
  };
}

export async function getClients({
  includeArchived = false,
}: {
  includeArchived?: boolean;
} = {}): Promise<Client[]> {
  const ownerId =
    await getCurrentAppUserId();

  const rows = includeArchived
    ? await sql`
        SELECT
          id,
          owner_id,
          name,
          company_name,
          email,
          phone,
          address_line_1,
          address_line_2,
          city,
          state,
          postal_code,
          country_code,
          notes,
          status,
          created_at,
          updated_at
        FROM public.clients
        WHERE owner_id = ${ownerId}::uuid
        ORDER BY name ASC
      `
    : await sql`
        SELECT
          id,
          owner_id,
          name,
          company_name,
          email,
          phone,
          address_line_1,
          address_line_2,
          city,
          state,
          postal_code,
          country_code,
          notes,
          status,
          created_at,
          updated_at
        FROM public.clients
        WHERE
          owner_id = ${ownerId}::uuid
          AND status <> 'archived'
        ORDER BY name ASC
      `;

  return (rows as ClientRow[]).map(
    mapClientRow
  );
}

export async function getClientById(
  clientId: string
): Promise<Client | null> {
  if (!isValidUuid(clientId)) {
    return null;
  }

  const ownerId =
    await getCurrentAppUserId();

  const rows = await sql`
    SELECT
      id,
      owner_id,
      name,
      company_name,
      email,
      phone,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country_code,
      notes,
      status,
      created_at,
      updated_at
    FROM public.clients
    WHERE
      id = ${clientId}::uuid
      AND owner_id = ${ownerId}::uuid
    LIMIT 1
  `;

  const client =
    rows[0] as ClientRow | undefined;

  return client
    ? mapClientRow(client)
    : null;
}

export async function createClient(
  _previousState: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  try {
    const parsed =
      parseClientFormData(formData);

    if (!parsed.success) {
      return parsed.result;
    }

    const ownerId =
      await getCurrentAppUserId();

    const data = parsed.data;

    const rows = await sql`
      INSERT INTO public.clients (
        owner_id,
        name,
        company_name,
        email,
        phone,
        address_line_1,
        address_line_2,
        city,
        state,
        postal_code,
        country_code,
        notes,
        status,
        created_at,
        updated_at
      )
      VALUES (
        ${ownerId}::uuid,
        ${data.name},
        ${optionalText(data.companyName)},
        ${optionalText(data.email)},
        ${optionalText(data.phone)},
        ${optionalText(data.addressLine1)},
        ${optionalText(data.addressLine2)},
        ${optionalText(data.city)},
        ${optionalText(data.state)},
        ${optionalText(data.postalCode)},
        ${optionalText(data.countryCode)},
        ${optionalText(data.notes)},
        ${data.status},
        NOW(),
        NOW()
      )
      RETURNING id
    `;

    const created = rows[0] as
      | {
          id: string;
        }
      | undefined;

    if (!created) {
      throw new Error(
        'Cliente não retornado após a criação.'
      );
    }

    revalidatePath('/clientes');

    return {
      success: true,
      message:
        'Cliente cadastrado com sucesso.',
      clientId: String(created.id),
    };
  } catch (error) {
    console.error(
      'Erro ao criar cliente:',
      error
    );

    return {
      success: false,
      message:
        'Não foi possível cadastrar o cliente.',
    };
  }
}

export async function updateClient(
  clientId: string,
  _previousState: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  try {
    if (!isValidUuid(clientId)) {
      return {
        success: false,
        message:
          'Identificador do cliente inválido.',
      };
    }

    const parsed =
      parseClientFormData(formData);

    if (!parsed.success) {
      return parsed.result;
    }

    const ownerId =
      await getCurrentAppUserId();

    const data = parsed.data;

    const rows = await sql`
      UPDATE public.clients
      SET
        name = ${data.name},
        company_name =
          ${optionalText(data.companyName)},
        email =
          ${optionalText(data.email)},
        phone =
          ${optionalText(data.phone)},
        address_line_1 =
          ${optionalText(data.addressLine1)},
        address_line_2 =
          ${optionalText(data.addressLine2)},
        city =
          ${optionalText(data.city)},
        state =
          ${optionalText(data.state)},
        postal_code =
          ${optionalText(data.postalCode)},
        country_code =
          ${optionalText(data.countryCode)},
        notes =
          ${optionalText(data.notes)},
        status = ${data.status},
        updated_at = NOW()
      WHERE
        id = ${clientId}::uuid
        AND owner_id = ${ownerId}::uuid
      RETURNING id
    `;

    const updated = rows[0];

    if (!updated) {
      return {
        success: false,
        message:
          'Cliente não encontrado.',
      };
    }

    revalidatePath('/clientes');
    revalidatePath(
      `/clientes/${clientId}`
    );
    revalidatePath(
      `/clientes/${clientId}/editar`
    );

    return {
      success: true,
      message:
        'Cliente atualizado com sucesso.',
      clientId,
    };
  } catch (error) {
    console.error(
      'Erro ao atualizar cliente:',
      error
    );

    return {
      success: false,
      message:
        'Não foi possível atualizar o cliente.',
    };
  }
}

export async function archiveClient(
  clientId: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!isValidUuid(clientId)) {
      return {
        success: false,
        message:
          'Identificador do cliente inválido.',
      };
    }

    const ownerId =
      await getCurrentAppUserId();

    const rows = await sql`
      UPDATE public.clients
      SET
        status = 'archived',
        updated_at = NOW()
      WHERE
        id = ${clientId}::uuid
        AND owner_id = ${ownerId}::uuid
      RETURNING id
    `;

    if (!rows[0]) {
      return {
        success: false,
        message:
          'Cliente não encontrado.',
      };
    }

    revalidatePath('/clientes');

    return {
      success: true,
      message:
        'Cliente arquivado com sucesso.',
    };
  } catch (error) {
    console.error(
      'Erro ao arquivar cliente:',
      error
    );

    return {
      success: false,
      message:
        'Não foi possível arquivar o cliente.',
    };
  }
}