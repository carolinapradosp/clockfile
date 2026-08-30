import { expect, type Locator, type Page } from '@playwright/test';

export const PROJECT_DETAILS_URL =
    /\/projetos\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const REPORT_DETAILS_URL =
    /^\/relatorios\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const INVOICE_DETAILS_URL =
    /^\/faturas\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function waitForOptionByLabel({
    page,
    select,
    label,
    timeout = 20_000,
}: {
    page: Page;
    select: Locator;
    label: string;
    timeout?: number;
}) {
    const maxAttempts = 4;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        await expect(select).toBeVisible({
            timeout,
        });

        const option = select.locator('option').filter({
            hasText: label,
        });

        if ((await option.count()) > 0) {
            await expect(option.first()).toBeAttached({
                timeout,
            });

            return option.first();
        }

        if (attempt < maxAttempts) {
            await page.waitForTimeout(500);

            await page.reload({
                waitUntil: 'networkidle',
            });
        }
    }

    throw new Error(
        `A opção "${label}" não foi encontrada no select após ${maxAttempts} tentativas.`
    );
}

export async function selectOptionByLabel({
    page,
    select,
    label,
}: {
    page: Page;
    select: Locator;
    label: string;
}) {
    const option = await waitForOptionByLabel({
        page,
        select,
        label,
    });

    const value = await option.getAttribute('value');

    expect(value).toBeTruthy();

    await select.selectOption(value!);

    await expect(select).toHaveValue(value!);
}

export async function createProject({
    page,
    projectName,
    hourlyRate = '200',
    recipientName = 'Cliente Teste Automatizado',
    recipientEmail,
    description = 'Projeto criado automaticamente pelo teste E2E.',
}: {
    page: Page;
    projectName: string;
    hourlyRate?: string;
    recipientName?: string;
    recipientEmail?: string;
    description?: string;
}) {
    await page.goto('/projetos/novo', {
        waitUntil: 'networkidle',
    });

    await page.locator('input[name="name"]').fill(projectName);
    await page.locator('textarea[name="description"]').fill(description);
    await page.locator('select[name="status"]').selectOption('active');
    await page.locator('select[name="currency"]').selectOption('BRL');
    await page.locator('input[name="defaultHourlyRate"]').fill(hourlyRate);
    await page.locator('input[name="billingName"]').fill(recipientName);
    await page
        .locator('input[name="billingEmail"]')
        .fill(
            recipientEmail ??
                `cliente-${Date.now()}-${Math.random().toString(36).slice(2)}@clockfile.test`
        );
    await page.locator('select[name="billingCountryCode"]').selectOption('BR');

    const submitButton = page.getByRole('button', {
        name: 'Cadastrar projeto',
        exact: true,
    });

    await expect(submitButton).toBeEnabled();

    await submitButton.click();

    await expect(page).toHaveURL(PROJECT_DETAILS_URL, {
        timeout: 30_000,
    });

    const projectId = new URL(page.url()).pathname.split('/').filter(Boolean).at(-1);

    expect(projectId).toMatch(UUID_PATTERN);

    return projectId!;
}

export async function createReportEntry({
    page,
    projectName,
    taskName,
    date = '2026-12-20',
    duration = '02:00',
    description = 'Lançamento criado automaticamente pelo teste E2E.',
    expectedRate = '200',
}: {
    page: Page;
    projectName: string;
    taskName: string;
    date?: string;
    duration?: string;
    description?: string;
    expectedRate?: string;
}) {
    await page.goto('/relatorios/novo', {
        waitUntil: 'networkidle',
    });

    const projectSelect = page.locator('select[name="projectId"]');

    await selectOptionByLabel({
        page,
        select: projectSelect,
        label: projectName,
    });

    await page.locator('input[name="task"]').fill(taskName);
    await page.locator('textarea[name="description"]').fill(description);
    await page.locator('input[name="date"]').fill(date);
    await page.locator('input[name="duration"]').fill(duration);

    await expect(page.locator('input[name="rate"]')).toHaveValue(expectedRate);

    const saveButton = page.getByRole('button', {
        name: 'Salvar lançamento',
        exact: true,
    });

    await expect(saveButton).toBeEnabled();

    await saveButton.click();

    await expect(page).toHaveURL(/\/relatorios(?:\?.*)?$/, {
        timeout: 20_000,
    });
}

export async function getReportEntryUrl({
    page,
    taskName,
    month,
}: {
    page: Page;
    taskName: string;
    month: string;
}) {
    await page.goto(`/relatorios?month=${month}`, {
        waitUntil: 'networkidle',
    });

    const entryLink = page.getByRole('link', {
        name: taskName,
        exact: true,
    });

    await expect(entryLink).toBeVisible({
        timeout: 15_000,
    });

    const href = await entryLink.getAttribute('href');

    expect(href).not.toBeNull();
    expect(href).toMatch(REPORT_DETAILS_URL);

    return href!;
}

export async function createDraftInvoice({
    page,
    projectName,
    referenceMonth,
}: {
    page: Page;
    projectName: string;
    referenceMonth: string;
}) {
    await page.goto('/faturas/novo', {
        waitUntil: 'networkidle',
    });

    const projectSelect = page.locator('#invoice-project');

    await selectOptionByLabel({
        page,
        select: projectSelect,
        label: projectName,
    });

    await page.locator('#reference-month').fill(referenceMonth);

    const importButton = page.getByRole('button', {
        name: 'Importar horas do mês',
        exact: true,
    });

    await expect(importButton).toBeEnabled();

    await importButton.click();

    await expect(page.getByText(/lançamento\(s\) foram importados para a fatura/i)).toBeVisible();

    const saveButton = page.getByRole('button', {
        name: 'Salvar rascunho',
        exact: true,
    });

    await expect(saveButton).toBeEnabled();

    await saveButton.click();

    await expect(page).not.toHaveURL(/\/faturas\/novo$/, {
        timeout: 20_000,
    });

    const invoicePath = new URL(page.url()).pathname;

    expect(invoicePath).toMatch(INVOICE_DETAILS_URL);

    return page.url();
}

export async function confirmModalAction({
    page,
    confirmButtonName,
    timeout = 15_000,
}: {
    page: Page;
    confirmButtonName: string;
    timeout?: number;
}) {
    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible();

    const confirmButton = dialog.getByRole('button', {
        name: confirmButtonName,
        exact: true,
    });

    await expect(confirmButton).toBeEnabled();

    await confirmButton.click();

    /*
     * Essencial:
     *
     * click() não espera um async onClick React
     * terminar.
     *
     * O desaparecimento do modal representa
     * que a Server Action terminou e o estado
     * local foi limpo.
     */
    await expect(dialog).toBeHidden({
        timeout,
    });
}
