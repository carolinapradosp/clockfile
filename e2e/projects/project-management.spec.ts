//e2e/projects/project-management.spec.ts

import { expect, test, type Page } from '@playwright/test';

test.setTimeout(60_000);

const PROJECT_DETAILS_URL =
    /\/projetos\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const INVOICE_DETAILS_URL =
    /\/faturas\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function waitForProjectOption({
    page,
    select,
    projectName,
}: {
    page: Page;
    select: ReturnType<Page['locator']>;
    projectName: string;
}) {
    const option = () =>
        select.locator('option').filter({
            hasText: projectName,
        });

    if (!(await option().count())) {
        await page.reload({
            waitUntil: 'networkidle',
        });
    }

    await expect(option()).toBeAttached({
        timeout: 20_000,
    });
}

async function createProject({
    page,
    projectName,
    hourlyRate = '200',
}: {
    page: Page;
    projectName: string;
    hourlyRate?: string;
}) {
    await page.goto('/projetos/novo', {
        waitUntil: 'networkidle',
    });

    const nameInput = page.locator('input[name="name"]');
    const descriptionInput = page.locator('textarea[name="description"]');
    const statusSelect = page.locator('select[name="status"]');
    const currencySelect = page.locator('select[name="currency"]');
    const hourlyRateInput = page.locator('input[name="defaultHourlyRate"]');
    const billingNameInput = page.locator('input[name="billingName"]');
    const billingEmailInput = page.locator('input[name="billingEmail"]');
    const billingCountrySelect = page.locator('select[name="billingCountryCode"]');

    await expect(nameInput).toBeVisible();

    await nameInput.fill(projectName);

    await descriptionInput.fill('Projeto criado pelo teste E2E de gerenciamento.');

    await statusSelect.selectOption('active');

    await currencySelect.selectOption('BRL');

    await hourlyRateInput.fill(hourlyRate);

    await billingNameInput.fill('Cliente Projeto E2E');

    await billingEmailInput.fill(
        `cliente-${Date.now()}-${Math.random().toString(36).slice(2)}@clockfile.test`
    );

    await billingCountrySelect.selectOption('BR');

    const submitButton = page.getByRole('button', {
        name: 'Cadastrar projeto',
        exact: true,
    });

    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();

    await submitButton.click();

    try {
        await expect(page).toHaveURL(PROJECT_DETAILS_URL, {
            timeout: 30_000,
        });
    } catch (error) {
        const formAlert = page.getByRole('alert').filter({
            hasText: /.+/,
        });

        if (
            await formAlert
                .first()
                .isVisible()
                .catch(() => false)
        ) {
            console.error('Erro ao criar projeto:', await formAlert.first().textContent());
        }

        console.error('URL após tentativa de criar projeto:', page.url());

        throw error;
    }

    const projectId = new URL(page.url()).pathname.split('/').filter(Boolean).at(-1);

    expect(projectId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );

    return projectId!;
}

async function createReportEntry({
    page,
    projectName,
    taskName,
}: {
    page: Page;
    projectName: string;
    taskName: string;
}) {
    await page.goto('/relatorios/novo', {
        waitUntil: 'networkidle',
    });

    const projectSelect = page.locator('select[name="projectId"]');

    await expect(projectSelect).toBeVisible();

    await waitForProjectOption({
        page,
        select: projectSelect,
        projectName,
    });

    await projectSelect.selectOption({
        label: projectName,
    });

    await page.locator('input[name="task"]').fill(taskName);

    await page
        .locator('textarea[name="description"]')
        .fill('Lançamento criado para bloquear exclusão do projeto.');

    await page.locator('input[name="date"]').fill('2026-12-20');

    await page.locator('input[name="duration"]').fill('01:00');

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

async function createManualDraftInvoice({
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

    await waitForProjectOption({
        page,
        select: projectSelect,
        projectName,
    });

    await projectSelect.selectOption({
        label: projectName,
    });

    await page.locator('#reference-month').fill(referenceMonth);

    const billToName = page.locator('input[name="billToName"]');
    const billToEmail = page.locator('input[name="billToEmail"]');
    const billToCountry = page.locator('select[name="billToCountryCode"]');

    await expect(billToName).toBeVisible();

    await billToName.fill('Cliente Cascata E2E');

    await billToEmail.fill(
        `cascata-${Date.now()}-${Math.random().toString(36).slice(2)}@clockfile.test`
    );

    await billToCountry.selectOption('BR');

    const itemsSection = page
        .getByRole('heading', {
            name: 'Itens da fatura',
            exact: true,
        })
        .locator('xpath=ancestor::section');

    await expect(itemsSection).toBeVisible();

    const descriptionInput = itemsSection.getByRole('textbox').first();

    await expect(descriptionInput).toBeVisible();

    await descriptionInput.fill('Serviço manual E2E');

    const numberInputs = itemsSection.locator('input[type="number"]');

    await expect(numberInputs).toHaveCount(3);

    await numberInputs.nth(0).fill('1');
    await numberInputs.nth(1).fill('150');
    await numberInputs.nth(2).fill('150');

    const saveButton = page.getByRole('button', {
        name: 'Salvar rascunho',
        exact: true,
    });

    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();

    await saveButton.click();

    try {
        await expect(page).toHaveURL(INVOICE_DETAILS_URL, {
            timeout: 30_000,
        });
    } catch (error) {
        const formAlert = page.getByRole('alert').filter({
            hasText: /.+/,
        });

        if (
            await formAlert
                .first()
                .isVisible()
                .catch(() => false)
        ) {
            console.error('Erro ao criar fatura manual:', await formAlert.first().textContent());
        }

        console.error('URL após tentativa de salvar fatura:', page.url());

        throw error;
    }

    const invoicePath = new URL(page.url()).pathname;

    const invoiceId = invoicePath.split('/').filter(Boolean).at(-1);

    expect(invoiceId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );

    return {
        invoiceUrl: page.url(),
        invoiceId: invoiceId!,
    };
}

test.describe('Gerenciamento de projetos', () => {
    test('usuário consegue editar um projeto e persistir as alterações', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Editar E2E ${timestamp}`;
        const updatedName = `Projeto Editado E2E ${timestamp}`;

        const projectId = await createProject({
            page,
            projectName,
        });

        await page.goto(`/projetos/${projectId}/editar`, {
            waitUntil: 'networkidle',
        });

        await expect(
            page.getByRole('heading', {
                name: 'Editar projeto',
                exact: true,
            })
        ).toBeVisible();

        await page.locator('input[name="name"]').fill(updatedName);

        await page
            .locator('textarea[name="description"]')
            .fill('Descrição atualizada pelo teste E2E.');

        await page.locator('select[name="status"]').selectOption('paused');

        await page.locator('select[name="currency"]').selectOption('USD');

        await page.locator('input[name="defaultHourlyRate"]').fill('350');

        const saveButton = page.getByRole('button', {
            name: /Salvar alterações|Atualizar projeto/i,
        });

        await expect(saveButton).toBeEnabled();

        await saveButton.click();

        await expect(page).toHaveURL(`/projetos/${projectId}`, {
            timeout: 20_000,
        });

        await expect(
            page.getByRole('heading', {
                name: updatedName,
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText('Pausado', {
                exact: true,
            })
        ).toBeVisible();

        await page.goto('/projetos');

        await expect(
            page.getByRole('heading', {
                name: updatedName,
                exact: true,
            })
        ).toBeVisible();
    });

    test('usuário consegue excluir projeto sem lançamentos', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Excluir E2E ${timestamp}`;

        const projectId = await createProject({
            page,
            projectName,
        });

        await page.goto(`/projetos/${projectId}`);

        await page
            .getByRole('button', {
                name: 'Excluir',
                exact: true,
            })
            .click();

        await expect(
            page.getByRole('heading', {
                name: 'Excluir projeto?',
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText(
                `Deseja excluir permanentemente o projeto "${projectName}"? Faturas vinculadas ao projeto também poderão ser removidas conforme as regras atuais do sistema. Essa ação não poderá ser desfeita.`,
                {
                    exact: true,
                }
            )
        ).toBeVisible();

        await page
            .getByRole('button', {
                name: 'Excluir projeto',
                exact: true,
            })
            .click();

        await expect(page).toHaveURL(/\/projetos$/, {
            timeout: 20_000,
        });

        await expect(
            page.getByRole('heading', {
                name: projectName,
                exact: true,
            })
        ).not.toBeVisible();
    });

    test('não permite excluir projeto que possui lançamentos', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Bloqueado E2E ${timestamp}`;
        const taskName = `Tarefa Bloqueio E2E ${timestamp}`;

        const projectId = await createProject({
            page,
            projectName,
        });

        await createReportEntry({
            page,
            projectName,
            taskName,
        });

        await page.goto(`/projetos/${projectId}`);

        await page
            .getByRole('button', {
                name: 'Excluir',
                exact: true,
            })
            .click();

        await expect(
            page.getByRole('heading', {
                name: 'Excluir projeto?',
                exact: true,
            })
        ).toBeVisible();

        await page
            .getByRole('button', {
                name: 'Excluir projeto',
                exact: true,
            })
            .click();

        const alert = page.getByRole('alert').filter({
            hasText: /O projeto não pode ser excluído porque possui 1 lançamento/i,
        });

        await expect(alert).toBeVisible();

        await expect(alert).toContainText(
            'O projeto não pode ser excluído porque possui 1 lançamento'
        );

        await expect(page).toHaveURL(`/projetos/${projectId}`);

        await expect(
            page.getByRole('heading', {
                name: projectName,
                exact: true,
            })
        ).toBeVisible();
    });

    test('excluir projeto sem lançamentos também remove a fatura vinculada', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Cascata E2E ${timestamp}`;
        const referenceMonth = '2027-02';

        const projectId = await createProject({
            page,
            projectName,
        });

        const { invoiceId, invoiceUrl } = await createManualDraftInvoice({
            page,
            projectName,
            referenceMonth,
        });

        await expect(page).toHaveURL(invoiceUrl);

        await expect(
            page.getByRole('heading', {
                name: /^Fatura #/,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('link', {
                name: projectName,
                exact: true,
            })
        ).toBeVisible();

        await page.goto(`/projetos/${projectId}`);

        await expect(
            page.getByRole('heading', {
                name: projectName,
                exact: true,
            })
        ).toBeVisible();

        await page
            .getByRole('button', {
                name: 'Excluir',
                exact: true,
            })
            .click();

        await expect(
            page.getByRole('heading', {
                name: 'Excluir projeto?',
                exact: true,
            })
        ).toBeVisible();

        await page
            .getByRole('button', {
                name: 'Excluir projeto',
                exact: true,
            })
            .click();

        await expect(page).toHaveURL(/\/projetos$/, {
            timeout: 20_000,
        });

        await expect(
            page.getByRole('heading', {
                name: projectName,
                exact: true,
            })
        ).not.toBeVisible();

        await page.goto('/faturas', {
            waitUntil: 'networkidle',
        });

        await expect(page.locator(`a[href="/faturas/${invoiceId}"]`)).toHaveCount(0);

        await expect(
            page.getByRole('link', {
                name: projectName,
                exact: true,
            })
        ).toHaveCount(0);
    });

    test('usuário consegue concluir um projeto e manter o acesso pela listagem', async ({
        page,
    }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Concluído E2E ${timestamp}`;

        const projectId = await createProject({
            page,
            projectName,
        });

        await page.goto(`/projetos/${projectId}/editar`, {
            waitUntil: 'networkidle',
        });

        await expect(
            page.getByRole('heading', {
                name: 'Editar projeto',
                exact: true,
            })
        ).toBeVisible();

        const statusSelect = page.locator('select[name="status"]');

        await expect(statusSelect).toBeVisible();

        await expect(statusSelect.locator('option')).toHaveCount(4);

        await statusSelect.selectOption('completed');

        await expect(statusSelect).toHaveValue('completed');

        const saveButton = page.getByRole('button', {
            name: 'Salvar alterações',
            exact: true,
        });

        await expect(saveButton).toBeEnabled();

        await saveButton.click();

        await expect(page).toHaveURL(`/projetos/${projectId}`, {
            timeout: 20_000,
        });

        await expect(
            page.getByRole('heading', {
                name: projectName,
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText('Concluído', {
                exact: true,
            })
        ).toBeVisible();

        await page.goto('/projetos', {
            waitUntil: 'networkidle',
        });

        const projectLink = page.locator(`a[href="/projetos/${projectId}"]`);

        await expect(projectLink).toBeVisible();

        await expect(
            projectLink.getByRole('heading', {
                name: projectName,
                exact: true,
            })
        ).toBeVisible();

        await expect(
            projectLink.getByText('Concluído', {
                exact: true,
            })
        ).toBeVisible();

        await projectLink.click();

        await expect(page).toHaveURL(`/projetos/${projectId}`);

        await expect(
            page.getByRole('heading', {
                name: projectName,
                exact: true,
            })
        ).toBeVisible();
    });

    test('usuário consegue arquivar e reativar um projeto', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Arquivar E2E ${timestamp}`;

        const projectId = await createProject({
            page,
            projectName,
        });

        await page.goto(`/projetos/${projectId}`, {
            waitUntil: 'networkidle',
        });

        await expect(
            page.getByRole('heading', {
                name: projectName,
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText('Ativo', {
                exact: true,
            })
        ).toBeVisible();

        const archiveButton = page.getByRole('button', {
            name: 'Arquivar',
            exact: true,
        });

        await expect(archiveButton).toBeVisible();

        await archiveButton.click();

        const archiveDialog = page.getByRole('dialog');

        await expect(archiveDialog).toBeVisible();

        await expect(
            archiveDialog.getByRole('heading', {
                name: 'Arquivar projeto?',
                exact: true,
            })
        ).toBeVisible();

        await archiveDialog
            .getByRole('button', {
                name: 'Arquivar projeto',
                exact: true,
            })
            .click();

        await expect(
            page.getByText('Arquivado', {
                exact: true,
            })
        ).toBeVisible({
            timeout: 20_000,
        });

        await expect(
            page.getByRole('button', {
                name: 'Reativar',
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('link', {
                name: 'Novo lançamento',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('link', {
                name: 'Editar',
                exact: true,
            })
        ).toHaveCount(0);

        await page.goto('/projetos', {
            waitUntil: 'networkidle',
        });

        const archivedProjectLink = page.locator(`a[href="/projetos/${projectId}"]`);

        await expect(archivedProjectLink).toBeVisible();

        await expect(
            archivedProjectLink.getByRole('heading', {
                name: projectName,
                exact: true,
            })
        ).toBeVisible();

        await expect(
            archivedProjectLink.getByText('Arquivado', {
                exact: true,
            })
        ).toBeVisible();

        await page.goto('/relatorios/novo', {
            waitUntil: 'networkidle',
        });

        const reportProjectSelect = page.locator('select[name="projectId"]');

        await expect(reportProjectSelect).toBeVisible();

        await expect(
            reportProjectSelect.locator('option').filter({
                hasText: projectName,
            })
        ).toHaveCount(0);

        await page.goto('/faturas/novo', {
            waitUntil: 'networkidle',
        });

        const invoiceProjectSelect = page.locator('#invoice-project');

        await expect(invoiceProjectSelect).toBeVisible();

        await expect(
            invoiceProjectSelect.locator('option').filter({
                hasText: projectName,
            })
        ).toHaveCount(0);

        await page.goto(`/projetos/${projectId}/editar`, {
            waitUntil: 'networkidle',
        });

        await expect(page).toHaveURL(`/projetos/${projectId}`, {
            timeout: 20_000,
        });

        await expect(
            page.getByText('Arquivado', {
                exact: true,
            })
        ).toBeVisible();

        const reactivateButton = page.getByRole('button', {
            name: 'Reativar',
            exact: true,
        });

        await expect(reactivateButton).toBeVisible();

        await reactivateButton.click();

        const reactivateDialog = page.getByRole('dialog');

        await expect(reactivateDialog).toBeVisible();

        await expect(
            reactivateDialog.getByRole('heading', {
                name: 'Reativar projeto?',
                exact: true,
            })
        ).toBeVisible();

        await reactivateDialog
            .getByRole('button', {
                name: 'Reativar projeto',
                exact: true,
            })
            .click();

        await expect(
            page.getByText('Ativo', {
                exact: true,
            })
        ).toBeVisible({
            timeout: 20_000,
        });

        await expect(
            page.getByRole('button', {
                name: 'Arquivar',
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('link', {
                name: 'Novo lançamento',
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('link', {
                name: 'Editar',
                exact: true,
            })
        ).toBeVisible();

        await page.goto('/relatorios/novo', {
            waitUntil: 'networkidle',
        });

        const reactivatedReportSelect = page.locator('select[name="projectId"]');

        await expect(reactivatedReportSelect).toBeVisible();

        await waitForProjectOption({
            page,
            select: reactivatedReportSelect,
            projectName,
        });

        await page.goto('/faturas/novo', {
            waitUntil: 'networkidle',
        });

        const reactivatedInvoiceSelect = page.locator('#invoice-project');

        await expect(reactivatedInvoiceSelect).toBeVisible();

        await waitForProjectOption({
            page,
            select: reactivatedInvoiceSelect,
            projectName,
        });

        await page.goto('/projetos', {
            waitUntil: 'networkidle',
        });

        const activeProjectLink = page.locator(`a[href="/projetos/${projectId}"]`);

        await expect(activeProjectLink).toBeVisible();

        await expect(
            activeProjectLink.getByText('Ativo', {
                exact: true,
            })
        ).toBeVisible();
    });
});
