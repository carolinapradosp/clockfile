//e2e/reports/report-management.spec.ts
import { expect, test, type Page } from '@playwright/test';

test.setTimeout(60_000);

const PROJECT_DETAILS_URL =
    /\/projetos\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const REPORT_DETAILS_URL =
    /^\/relatorios\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const INVOICE_DETAILS_URL =
    /^\/faturas\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function createProject({
    page,
    projectName,
    recipientName = 'Cliente Relatorio',
    recipientEmail,
}: {
    page: Page;
    projectName: string;
    recipientName?: string;
    recipientEmail: string;
}) {
    await page.goto('/projetos/novo', {
        waitUntil: 'networkidle',
    });

    await page.locator('input[name="name"]').fill(projectName);

    await page
        .locator('textarea[name="description"]')
        .fill('Projeto criado pelo teste E2E de lançamentos.');

    await page.locator('select[name="status"]').selectOption('active');

    await page.locator('select[name="currency"]').selectOption('BRL');

    await page.locator('input[name="defaultHourlyRate"]').fill('200');

    await page.locator('input[name="billingName"]').fill(recipientName);

    await page.locator('input[name="billingEmail"]').fill(recipientEmail);

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
}

async function createReportEntry({
    page,
    projectName,
    taskName,
    date,
    duration = '02:00',
}: {
    page: Page;
    projectName: string;
    taskName: string;
    date: string;
    duration?: string;
}) {
    await page.goto('/relatorios/novo', {
        waitUntil: 'networkidle',
    });

    const projectSelect = page.locator('select[name="projectId"]');

    await expect(projectSelect).toBeVisible();

    const projectOption = () =>
        projectSelect.locator('option').filter({
            hasText: projectName,
        });

    if (!(await projectOption().count())) {
        await page.reload({
            waitUntil: 'networkidle',
        });
    }

    await expect(projectOption()).toBeAttached({
        timeout: 20_000,
    });

    await projectSelect.selectOption({
        label: projectName,
    });

    await page.locator('input[name="task"]').fill(taskName);

    await page
        .locator('textarea[name="description"]')
        .fill('Descrição original do lançamento E2E.');

    await page.locator('input[name="date"]').fill(date);

    await page.locator('input[name="duration"]').fill(duration);

    await expect(page.locator('input[name="rate"]')).toHaveValue('200');

    const saveButton = page.getByRole('button', {
        name: 'Salvar lançamento',
        exact: true,
    });

    await expect(saveButton).toBeEnabled();

    await saveButton.click();

    await expect(page).toHaveURL(/\/relatorios(?:\?.*)?$/, {
        timeout: 20_000,
    });

    const month = date.slice(0, 7);

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

async function createDraftInvoice({
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

    await expect(projectSelect).toBeVisible();

    const projectOption = () =>
        projectSelect.locator('option').filter({
            hasText: projectName,
        });

    if (!(await projectOption().count())) {
        await page.reload({
            waitUntil: 'networkidle',
        });
    }

    await expect(projectOption()).toBeAttached({
        timeout: 20_000,
    });

    await projectSelect.selectOption({
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

    try {
        await expect(page).not.toHaveURL(/\/faturas\/novo$/, {
            timeout: 20_000,
        });
    } catch (error) {
        const alert = page.getByRole('alert').filter({
            hasText: /.+/,
        });

        if (
            await alert
                .first()
                .isVisible()
                .catch(() => false)
        ) {
            console.error('Erro ao salvar fatura:', await alert.first().textContent());
        }

        console.error('URL após tentativa de salvar fatura:', page.url());

        throw error;
    }

    const invoicePath = new URL(page.url()).pathname;

    expect(invoicePath).toMatch(INVOICE_DETAILS_URL);

    return page.url();
}

async function getReportEntryUrl({
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

test.describe('Gerenciamento de lançamentos', () => {
    test('usuário consegue editar lançamento e recalcular o valor', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Relatório Editar E2E ${timestamp}`;

        const taskName = `Tarefa Relatório E2E ${timestamp}`;

        const updatedTask = `Tarefa Relatório Editada E2E ${timestamp}`;

        await createProject({
            page,
            projectName,
            recipientName: 'Cliente Faturado',
            recipientEmail: `editar-${timestamp}@clockfile.test`,
        });

        const entryUrl = await createReportEntry({
            page,
            projectName,
            taskName,
            date: '2027-03-10',
            duration: '02:00',
        });

        await page.goto(entryUrl, {
            waitUntil: 'networkidle',
        });

        await expect(
            page.getByRole('heading', {
                name: taskName,
                exact: true,
            })
        ).toBeVisible();

        await page
            .getByRole('link', {
                name: 'Editar',
                exact: true,
            })
            .click();

        await expect(page).toHaveURL(`${entryUrl}/editar`);

        await expect(page.locator('input[name="duration"]')).toHaveValue('02:00');

        await expect(page.locator('input[name="rate"]')).toHaveValue('200');

        await page.locator('input[name="task"]').fill(updatedTask);

        await page
            .locator('textarea[name="description"]')
            .fill('Descrição atualizada pelo teste E2E.');

        await page.locator('input[name="duration"]').fill('03:00');

        await expect(page.locator('input[name="rate"]')).toHaveValue('200');

        const calculatedValue = page
            .getByText('Valor calculado', {
                exact: true,
            })
            .locator('..');

        await expect(calculatedValue).toContainText(/R\$\s*600,00/);

        const saveButton = page.getByRole('button', {
            name: 'Salvar alterações',
            exact: true,
        });

        await expect(saveButton).toBeEnabled();

        await saveButton.click();

        await expect(page).toHaveURL(/\/relatorios(?:\?.*)?$/, {
            timeout: 20_000,
        });

        await page.goto(entryUrl, {
            waitUntil: 'networkidle',
        });

        await expect(
            page.getByRole('heading', {
                name: updatedTask,
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText('Descrição atualizada pelo teste E2E.', {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText('03:00', {
                exact: true,
            })
        ).toBeVisible();
    });

    test('usuário consegue excluir lançamento não faturado', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Relatório Excluir E2E ${timestamp}`;

        const taskName = `Tarefa Excluir E2E ${timestamp}`;

        await createProject({
            page,
            projectName,
            recipientName: 'Cliente Faturado',
            recipientEmail: `excluir-${timestamp}@clockfile.test`,
        });

        const entryUrl = await createReportEntry({
            page,
            projectName,
            taskName,
            date: '2027-03-15',
            duration: '01:30',
        });

        await page.goto(entryUrl, {
            waitUntil: 'networkidle',
        });

        await expect(
            page.getByRole('heading', {
                name: taskName,
                exact: true,
            })
        ).toBeVisible();

        await page
            .getByRole('button', {
                name: 'Excluir',
                exact: true,
            })
            .click();

        const dialog = page.getByRole('dialog');

        await expect(dialog).toBeVisible();

        await expect(
            dialog.getByRole('heading', {
                name: 'Excluir lançamento?',
                exact: true,
            })
        ).toBeVisible();

        await expect(
            dialog.getByText(
                `Deseja excluir o lançamento "${taskName}"? Essa ação não poderá ser desfeita.`,
                {
                    exact: true,
                }
            )
        ).toBeVisible();

        await dialog
            .getByRole('button', {
                name: 'Excluir lançamento',
                exact: true,
            })
            .click();

        await expect(page).toHaveURL(/\/relatorios(?:\?.*)?$/, {
            timeout: 20_000,
        });

        await page.goto('/relatorios?month=2027-03', {
            waitUntil: 'networkidle',
        });

        await expect(
            page.getByRole('link', {
                name: taskName,
                exact: true,
            })
        ).toHaveCount(0);

        await page.goto(entryUrl, {
            waitUntil: 'networkidle',
        });

        await expect(
            page.getByRole('heading', {
                name: taskName,
                exact: true,
            })
        ).toHaveCount(0);
    });

    test('não permite excluir lançamento já vinculado a uma fatura', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Lançamento Faturado E2E ${timestamp}`;

        const taskName = `Tarefa Faturada E2E ${timestamp}`;

        const referenceMonth = '2027-04';
        const reportDate = '2027-04-15';

        await createProject({
            page,
            projectName,
            recipientName: 'Cliente Faturado',
            recipientEmail: `faturado-${timestamp}@clockfile.test`,
        });

        await createReportEntry({
            page,
            projectName,
            taskName,
            date: reportDate,
            duration: '02:00',
        });

        const entryUrl = await getReportEntryUrl({
            page,
            taskName,
            month: referenceMonth,
        });

        const invoiceUrl = await createDraftInvoice({
            page,
            projectName,
            referenceMonth,
        });

        await expect(page).toHaveURL(invoiceUrl);

        await expect(
            page.getByText('1 lançamento vinculado', {
                exact: true,
            })
        ).toBeVisible();

        await page.goto(entryUrl, {
            waitUntil: 'networkidle',
        });

        await expect(
            page.getByRole('heading', {
                name: taskName,
                exact: true,
            })
        ).toBeVisible();

        await page
            .getByRole('button', {
                name: 'Excluir',
                exact: true,
            })
            .click();

        const dialog = page.getByRole('dialog');

        await expect(dialog).toBeVisible();

        await dialog
            .getByRole('button', {
                name: 'Excluir lançamento',
                exact: true,
            })
            .click();

        const errorMessage = page.getByText(
            'Este lançamento não pode ser excluído porque já está vinculado a uma fatura.',
            {
                exact: true,
            }
        );

        await expect(errorMessage).toBeVisible({
            timeout: 15_000,
        });

        await expect(page).toHaveURL(entryUrl);

        await expect(
            page.getByRole('heading', {
                name: taskName,
                exact: true,
            })
        ).toBeVisible();

        await page.goto(invoiceUrl, {
            waitUntil: 'networkidle',
        });

        await expect(
            page.getByText('1 lançamento vinculado', {
                exact: true,
            })
        ).toBeVisible();

        await page.goto(`/relatorios?month=${referenceMonth}`, {
            waitUntil: 'networkidle',
        });

        await expect(
            page.getByRole('link', {
                name: taskName,
                exact: true,
            })
        ).toBeVisible();

        await page.goto(entryUrl, {
            waitUntil: 'networkidle',
        });

        await expect(
            page.getByRole('heading', {
                name: taskName,
                exact: true,
            })
        ).toBeVisible();
    });

    test('não permite editar lançamento já vinculado a uma fatura', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Edição Faturada E2E ${timestamp}`;

        const taskName = `Tarefa Faturada Editar E2E ${timestamp}`;

        const changedTask = `${taskName} Alterada`;

        const referenceMonth = '2027-05';
        const reportDate = '2027-05-12';

        await createProject({
            page,
            projectName,
            recipientName: 'Cliente Faturado',
            recipientEmail: `editar-faturado-${timestamp}@clockfile.test`,
        });

        await createReportEntry({
            page,
            projectName,
            taskName,
            date: reportDate,
            duration: '02:00',
        });

        const entryUrl = await getReportEntryUrl({
            page,
            taskName,
            month: referenceMonth,
        });

        const invoiceUrl = await createDraftInvoice({
            page,
            projectName,
            referenceMonth,
        });

        await expect(page).toHaveURL(invoiceUrl);

        await expect(
            page.getByText('1 lançamento vinculado', {
                exact: true,
            })
        ).toBeVisible();

        await page.goto(`${entryUrl}/editar`, {
            waitUntil: 'networkidle',
        });

        await expect(
            page.getByRole('heading', {
                name: /Editar lançamento/i,
            })
        ).toBeVisible();

        await expect(page.locator('input[name="task"]')).toHaveValue(taskName);

        await expect(page.locator('input[name="duration"]')).toHaveValue('02:00');

        await page.locator('input[name="task"]').fill(changedTask);

        await page.locator('input[name="duration"]').fill('04:00');

        const saveButton = page.getByRole('button', {
            name: 'Salvar alterações',
            exact: true,
        });

        await expect(saveButton).toBeEnabled();

        await saveButton.click();

        const errorMessage = page.getByText(
            'Este lançamento não pode ser editado porque já está vinculado a uma fatura.',
            {
                exact: true,
            }
        );

        await expect(errorMessage).toBeVisible({
            timeout: 15_000,
        });

        await expect(page).toHaveURL(`${entryUrl}/editar`);

        await page.goto(entryUrl, {
            waitUntil: 'networkidle',
        });

        await expect(
            page.getByRole('heading', {
                name: taskName,
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('heading', {
                name: changedTask,
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByText('02:00', {
                exact: true,
            })
        ).toBeVisible();

        await page.goto(invoiceUrl, {
            waitUntil: 'networkidle',
        });

        await expect(
            page.getByText('1 lançamento vinculado', {
                exact: true,
            })
        ).toBeVisible();
    });
});
