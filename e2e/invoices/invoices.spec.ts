import { expect, test, type Locator, type Page } from '@playwright/test';

async function selectOptionByLabel({
    page,
    select,
    label,
}: {
    page: Page;
    select: Locator;
    label: string;
}) {
    await expect(select).toBeVisible();

    const option = () =>
        select.locator('option').filter({
            hasText: label,
        });

    if (!(await option().count())) {
        await page.reload();

        await expect(option()).toBeAttached({
            timeout: 15_000,
        });
    }

    await select.selectOption({
        label,
    });
}

async function createProject({
    page,
    projectName,
    hourlyRate = '200',
    recipientName = 'Cliente Teste Automatizado',
    recipientEmail,
}: {
    page: Page;
    projectName: string;
    hourlyRate?: string;
    recipientName?: string;
    recipientEmail: string;
}) {
    await page.goto('/projetos/novo');

    await page.locator('input[name="name"]').fill(projectName);

    await page
        .locator('textarea[name="description"]')
        .fill('Projeto criado automaticamente pelo teste E2E.');

    await page.locator('select[name="status"]').selectOption('active');

    await page.locator('select[name="currency"]').selectOption('BRL');

    await page.locator('input[name="defaultHourlyRate"]').fill(hourlyRate);

    await page.locator('input[name="billingName"]').fill(recipientName);

    await page.locator('input[name="billingEmail"]').fill(recipientEmail);

    await page.locator('select[name="billingCountryCode"]').selectOption('BR');

    await page
        .getByRole('button', {
            name: 'Cadastrar projeto',
            exact: true,
        })
        .click();

    await expect(page).toHaveURL(/\/projetos\/[^/]+$/, {
        timeout: 15_000,
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
    await page.goto('/relatorios/novo');

    const projectSelect = page.locator('select[name="projectId"]');

    await selectOptionByLabel({
        page,
        select: projectSelect,
        label: projectName,
    });

    await page.locator('input[name="task"]').fill(taskName);

    await page
        .locator('textarea[name="description"]')
        .fill('Lançamento criado automaticamente pelo teste E2E.');

    await page.locator('input[name="date"]').fill(date);

    await page.locator('input[name="duration"]').fill(duration);

    await expect(page.locator('input[name="rate"]')).toHaveValue('200');

    await page
        .getByRole('button', {
            name: 'Salvar lançamento',
            exact: true,
        })
        .click();

    await expect(page).toHaveURL(/\/relatorios(?:\?.*)?$/, {
        timeout: 15_000,
    });
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
    await page.goto('/faturas/novo');

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

    await page
        .getByRole('button', {
            name: 'Salvar rascunho',
            exact: true,
        })
        .click();

    await expect(page).not.toHaveURL(/\/faturas\/novo$/, {
        timeout: 15_000,
    });

    const currentPath = new URL(page.url()).pathname;

    expect(currentPath).toMatch(
        /^\/faturas\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );

    return page.url();
}

test.describe('Faturas', () => {
    test('usuário consegue criar rascunho, editar e emitir uma fatura com horas importadas', async ({
        page,
    }) => {
        const timestamp = Date.now();
        const projectName = `Projeto Fatura E2E ${timestamp}`;
        const taskName = `Tarefa Fatura E2E ${timestamp}`;
        const recipientName = 'Cliente Teste Automatizado';
        const recipientEmail = `cliente-${timestamp}@clockfile.test`;
        const today = new Date().toISOString().slice(0, 10);

        await createProject({
            page,
            projectName,
            recipientName,
            recipientEmail,
        });

        await createReportEntry({
            page,
            projectName,
            taskName,
            date: today,
        });

        await page.goto('/faturas/novo');

        const projectSelect = page.locator('#invoice-project');

        await selectOptionByLabel({
            page,
            select: projectSelect,
            label: projectName,
        });

        const projectId = await projectSelect.inputValue();

        await expect(page.locator('input[name="billToName"]')).toHaveValue(recipientName);

        await expect(page.locator('input[name="billToEmail"]')).toHaveValue(recipientEmail);

        await expect(page.locator('select[name="billToCountryCode"]')).toHaveValue('BR');

        const importButton = page.getByRole('button', {
            name: 'Importar horas do mês',
            exact: true,
        });

        await expect(importButton).toBeEnabled();

        await importButton.click();

        await expect(
            page.getByText(/lançamento\(s\) foram importados para a fatura/i)
        ).toBeVisible();

        const summaryCard = page
            .getByText('Subtotal', {
                exact: true,
            })
            .locator('xpath=ancestor::div[contains(@class,"rounded-2xl")]');

        const summaryAmounts = summaryCard.getByText(/400,00/);

        await expect(summaryAmounts).toHaveCount(2);

        await page
            .getByRole('button', {
                name: 'Salvar rascunho',
                exact: true,
            })
            .click();

        try {
            await expect(page).not.toHaveURL(/\/faturas\/novo$/, {
                timeout: 15_000,
            });
        } catch (error) {
            const alert = page.getByRole('alert').filter({
                hasText: /.+/,
            });

            if (await alert.first().isVisible()) {
                console.error('Erro ao salvar fatura:', await alert.first().textContent());
            }

            throw error;
        }

        const currentPath = new URL(page.url()).pathname;

        expect(currentPath).toMatch(
            /^\/faturas\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );

        const invoiceId = currentPath.split('/').filter(Boolean).at(-1);

        expect(invoiceId).toBeTruthy();

        const invoiceUrl = page.url();

        await expect(
            page.getByText('Ainda não emitida', {
                exact: true,
            })
        ).toBeVisible();

        await page.goto(`/faturas/${invoiceId}/editar`);

        await expect(page.locator('#invoice-project')).toHaveValue(projectId);

        const notes = 'Rascunho editado pelo teste E2E.';

        await page.locator('#invoice-notes').fill(notes);

        await page
            .getByRole('button', {
                name: 'Salvar rascunho',
                exact: true,
            })
            .click();

        await expect(page).toHaveURL(invoiceUrl, {
            timeout: 15_000,
        });

        await expect(
            page.getByText(notes, {
                exact: true,
            })
        ).toBeVisible();

        await page.goto(`/faturas/${invoiceId}/editar`);

        await expect(page.locator('#invoice-notes')).toHaveValue(notes);

        await page
            .getByRole('button', {
                name: 'Salvar e emitir',
                exact: true,
            })
            .click();

        await expect(page).toHaveURL(invoiceUrl, {
            timeout: 15_000,
        });

        await expect(
            page.getByText('Ainda não emitida', {
                exact: true,
            })
        ).not.toBeVisible();

        await expect(
            page.getByRole('link', {
                name: 'Editar',
                exact: true,
            })
        ).not.toBeVisible();
    });

    test('permite faturas no mesmo mês para projetos diferentes e bloqueia duplicidade no mesmo projeto', async ({
        page,
    }) => {
        const timestamp = Date.now();

        const projectA = `Projeto A Fatura E2E ${timestamp}`;
        const projectB = `Projeto B Fatura E2E ${timestamp}`;

        const referenceMonth = '2026-07';
        const reportDate = '2026-07-15';

        await createProject({
            page,
            projectName: projectA,
            recipientName: 'Cliente Projeto Alpha',
            recipientEmail: `alpha-${timestamp}@clockfile.test`,
        });

        await createReportEntry({
            page,
            projectName: projectA,
            taskName: `Tarefa Alpha ${timestamp}`,
            date: reportDate,
        });

        await createProject({
            page,
            projectName: projectB,
            recipientName: 'Cliente Projeto Beta',
            recipientEmail: `beta-${timestamp}@clockfile.test`,
        });

        await createReportEntry({
            page,
            projectName: projectB,
            taskName: `Tarefa Beta ${timestamp}`,
            date: reportDate,
        });

        const invoiceAUrl = await createDraftInvoice({
            page,
            projectName: projectA,
            referenceMonth,
        });

        expect(new URL(invoiceAUrl).pathname).toMatch(/^\/faturas\/[0-9a-f-]+$/i);

        const invoiceBUrl = await createDraftInvoice({
            page,
            projectName: projectB,
            referenceMonth,
        });

        expect(new URL(invoiceBUrl).pathname).toMatch(/^\/faturas\/[0-9a-f-]+$/i);

        expect(invoiceAUrl).not.toBe(invoiceBUrl);

        await createReportEntry({
            page,
            projectName: projectA,
            taskName: `Segunda Tarefa Alpha ${timestamp}`,
            date: '2026-07-20',
            duration: '01:00',
        });

        await page.goto('/faturas/novo');

        const projectSelect = page.locator('#invoice-project');

        await selectOptionByLabel({
            page,
            select: projectSelect,
            label: projectA,
        });

        await page.locator('#reference-month').fill(referenceMonth);

        const importButton = page.getByRole('button', {
            name: 'Importar horas do mês',
            exact: true,
        });

        await expect(importButton).toBeEnabled();

        await importButton.click();

        await expect(
            page.getByText(/lançamento\(s\) foram importados para a fatura/i)
        ).toBeVisible();

        await page
            .getByRole('button', {
                name: 'Salvar rascunho',
                exact: true,
            })
            .click();

        await expect(page).toHaveURL(/\/faturas\/novo$/, {
            timeout: 15_000,
        });

        const duplicateAlert = page.getByRole('alert').filter({
            hasText: 'Já existe uma fatura cadastrada para este projeto',
        });

        await expect(duplicateAlert).toBeVisible();

        await expect(duplicateAlert).toContainText(
            'Já existe uma fatura cadastrada para este projeto'
        );

        expect(new URL(page.url()).pathname).toBe('/faturas/novo');
    });

    test('excluir fatura libera novamente os lançamentos vinculados para faturamento', async ({
        page,
    }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Exclusão Fatura E2E ${timestamp}`;
        const taskName = `Tarefa Exclusão Fatura E2E ${timestamp}`;
        const referenceMonth = '2026-08';
        const reportDate = '2026-08-15';

        await createProject({
            page,
            projectName,
            recipientName: 'Cliente Exclusão Automatizada',
            recipientEmail: `exclusao-${timestamp}@clockfile.test`,
        });

        await createReportEntry({
            page,
            projectName,
            taskName,
            date: reportDate,
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

        const deleteButton = page.getByRole('button', {
            name: 'Excluir fatura',
            exact: true,
        });

        await expect(deleteButton).toBeVisible();

        await deleteButton.click();

        await expect(page.getByText(/Excluir fatura #.+\?/)).toBeVisible();

        await expect(
            page.getByText(
                /os lançamentos de horas vinculados voltarão a ficar disponíveis para faturamento/i
            )
        ).toBeVisible();

        const deleteButtons = page.getByRole('button', {
            name: 'Excluir fatura',
            exact: true,
        });

        await expect(deleteButtons).toHaveCount(2);

        await deleteButtons.last().click();

        await expect(page).toHaveURL(/\/faturas$/, {
            timeout: 15_000,
        });

        await page.goto('/faturas/novo');

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

        await expect(
            page.getByText(/1 lançamento\(s\) foram importados para a fatura/i)
        ).toBeVisible();

        await page
            .getByRole('button', {
                name: 'Salvar rascunho',
                exact: true,
            })
            .click();

        await expect(page).not.toHaveURL(/\/faturas\/novo$/, {
            timeout: 15_000,
        });

        expect(new URL(page.url()).pathname).toMatch(
            /^\/faturas\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
    });

    test('usuário consegue avançar a fatura de rascunho até paga', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Status Fatura E2E ${timestamp}`;
        const taskName = `Tarefa Status Fatura E2E ${timestamp}`;

        const referenceMonth = '2026-09';
        const reportDate = '2026-09-15';

        await createProject({
            page,
            projectName,
            recipientName: 'Cliente Status Automatizado',
            recipientEmail: `status-${timestamp}@clockfile.test`,
        });

        await createReportEntry({
            page,
            projectName,
            taskName,
            date: reportDate,
        });

        const invoiceUrl = await createDraftInvoice({
            page,
            projectName,
            referenceMonth,
        });

        await expect(page).toHaveURL(invoiceUrl);

        await expect(
            page.getByText('Ainda não emitida', {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText('Ainda não enviada', {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText('Pagamento pendente', {
                exact: true,
            })
        ).toBeVisible();

        const issueButton = page.getByRole('button', {
            name: 'Emitir fatura',
            exact: true,
        });

        await expect(issueButton).toBeVisible();

        await issueButton.click();

        await expect(
            page.getByText(
                'Deseja emitir esta fatura? Depois da emissão, a edição ficará bloqueada.',
                {
                    exact: true,
                }
            )
        ).toBeVisible();

        const issueButtons = page.getByRole('button', {
            name: 'Emitir fatura',
            exact: true,
        });

        await expect(issueButtons).toHaveCount(2);

        await issueButtons.last().click();

        await expect(
            page.getByRole('button', {
                name: 'Marcar como enviada',
                exact: true,
            })
        ).toBeVisible({
            timeout: 15_000,
        });

        await expect(
            page.getByText('Ainda não emitida', {
                exact: true,
            })
        ).not.toBeVisible();

        await expect(
            page.getByRole('link', {
                name: 'Editar',
                exact: true,
            })
        ).not.toBeVisible();

        const sendButton = page.getByRole('button', {
            name: 'Marcar como enviada',
            exact: true,
        });

        await sendButton.click();

        await expect(
            page.getByText('Confirma que esta fatura foi enviada ao cliente?', {
                exact: true,
            })
        ).toBeVisible();

        const sendButtons = page.getByRole('button', {
            name: 'Marcar como enviada',
            exact: true,
        });

        await expect(sendButtons).toHaveCount(2);

        await sendButtons.last().click();

        await expect(
            page.getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
        ).toBeVisible({
            timeout: 15_000,
        });

        await expect(
            page.getByText('Ainda não enviada', {
                exact: true,
            })
        ).not.toBeVisible();

        const paidButton = page.getByRole('button', {
            name: 'Marcar como paga',
            exact: true,
        });

        await paidButton.click();

        await expect(
            page.getByText('Confirma o recebimento integral desta fatura?', {
                exact: true,
            })
        ).toBeVisible();

        const paidButtons = page.getByRole('button', {
            name: 'Marcar como paga',
            exact: true,
        });

        await expect(paidButtons).toHaveCount(2);

        await paidButtons.last().click();

        await expect(
            page.getByText('Pagamento pendente', {
                exact: true,
            })
        ).not.toBeVisible({
            timeout: 15_000,
        });

        await expect(
            page.getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
        ).not.toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'Marcar como enviada',
                exact: true,
            })
        ).not.toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'Emitir fatura',
                exact: true,
            })
        ).not.toBeVisible();

        await expect(page).toHaveURL(invoiceUrl);
    });

    test('usuário consegue marcar fatura como vencida e depois como paga', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Vencida Fatura E2E ${timestamp}`;
        const taskName = `Tarefa Vencida Fatura E2E ${timestamp}`;

        const referenceMonth = '2026-10';
        const reportDate = '2026-10-15';

        await createProject({
            page,
            projectName,
            recipientName: 'Cliente Vencida Automatizado',
            recipientEmail: `vencida-${timestamp}@clockfile.test`,
        });

        await createReportEntry({
            page,
            projectName,
            taskName,
            date: reportDate,
        });

        const invoiceUrl = await createDraftInvoice({
            page,
            projectName,
            referenceMonth,
        });

        await expect(page).toHaveURL(invoiceUrl);

        const issueButton = page.getByRole('button', {
            name: 'Emitir fatura',
            exact: true,
        });

        await issueButton.click();

        const issueButtons = page.getByRole('button', {
            name: 'Emitir fatura',
            exact: true,
        });

        await expect(issueButtons).toHaveCount(2);

        await issueButtons.last().click();

        await expect(
            page.getByRole('button', {
                name: 'Marcar como enviada',
                exact: true,
            })
        ).toBeVisible({
            timeout: 15_000,
        });

        const sendButton = page.getByRole('button', {
            name: 'Marcar como enviada',
            exact: true,
        });

        await sendButton.click();

        const sendButtons = page.getByRole('button', {
            name: 'Marcar como enviada',
            exact: true,
        });

        await expect(sendButtons).toHaveCount(2);

        await sendButtons.last().click();

        await expect(
            page.getByRole('button', {
                name: 'Marcar como vencida',
                exact: true,
            })
        ).toBeVisible({
            timeout: 15_000,
        });

        const overdueButton = page.getByRole('button', {
            name: 'Marcar como vencida',
            exact: true,
        });

        await overdueButton.click();

        await expect(
            page.getByText('Deseja marcar esta fatura como vencida?', {
                exact: true,
            })
        ).toBeVisible();

        const overdueButtons = page.getByRole('button', {
            name: 'Marcar como vencida',
            exact: true,
        });

        await expect(overdueButtons).toHaveCount(2);

        await overdueButtons.last().click();

        await expect(
            page.getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
        ).toBeVisible({
            timeout: 15_000,
        });

        await expect(
            page.getByRole('button', {
                name: 'Reenviada ao cliente',
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'Cancelar',
                exact: true,
            })
        ).toBeVisible();

        const paidButton = page.getByRole('button', {
            name: 'Marcar como paga',
            exact: true,
        });

        await paidButton.click();

        await expect(
            page.getByText('Confirma o recebimento integral desta fatura?', {
                exact: true,
            })
        ).toBeVisible();

        const paidButtons = page.getByRole('button', {
            name: 'Marcar como paga',
            exact: true,
        });

        await expect(paidButtons).toHaveCount(2);

        await paidButtons.last().click();

        await expect(
            page.getByText('Pagamento pendente', {
                exact: true,
            })
        ).not.toBeVisible({
            timeout: 15_000,
        });

        await expect(
            page.getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
        ).not.toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'Reenviada ao cliente',
                exact: true,
            })
        ).not.toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'Cancelar',
                exact: true,
            })
        ).not.toBeVisible();

        await expect(page).toHaveURL(invoiceUrl);
    });
    test('usuário consegue cancelar uma fatura emitida', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Cancelada Fatura E2E ${timestamp}`;
        const taskName = `Tarefa Cancelada Fatura E2E ${timestamp}`;

        const referenceMonth = '2026-11';
        const reportDate = '2026-11-15';

        await createProject({
            page,
            projectName,
            recipientName: 'Cliente Cancelamento Automatizado',
            recipientEmail: `cancelamento-${timestamp}@clockfile.test`,
        });

        await createReportEntry({
            page,
            projectName,
            taskName,
            date: reportDate,
        });

        const invoiceUrl = await createDraftInvoice({
            page,
            projectName,
            referenceMonth,
        });

        await expect(page).toHaveURL(invoiceUrl);

        await expect(
            page.getByText('Não cancelada', {
                exact: true,
            })
        ).toBeVisible();

        const issueButton = page.getByRole('button', {
            name: 'Emitir fatura',
            exact: true,
        });

        await expect(issueButton).toBeVisible();

        await issueButton.click();

        await expect(
            page.getByText(
                'Deseja emitir esta fatura? Depois da emissão, a edição ficará bloqueada.',
                {
                    exact: true,
                }
            )
        ).toBeVisible();

        const issueButtons = page.getByRole('button', {
            name: 'Emitir fatura',
            exact: true,
        });

        await expect(issueButtons).toHaveCount(2);

        await issueButtons.last().click();

        const cancelAction = page.getByRole('button', {
            name: 'Cancelar',
            exact: true,
        });

        await expect(cancelAction).toBeVisible({
            timeout: 15_000,
        });

        await cancelAction.click();

        await expect(
            page.getByText(
                'Deseja cancelar esta fatura? Os lançamentos vinculados voltarão a ficar disponíveis somente se a fatura for excluída ou os vínculos forem removidos.',
                {
                    exact: true,
                }
            )
        ).toBeVisible();

        const confirmCancellationButton = page.getByRole('button', {
            name: 'Confirmar cancelamento',
            exact: true,
        });

        await expect(confirmCancellationButton).toBeVisible();

        await confirmCancellationButton.click();

        await expect(
            page.getByText('Não cancelada', {
                exact: true,
            })
        ).not.toBeVisible({
            timeout: 15_000,
        });

        await expect(
            page.getByText('Pagamento pendente', {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'Marcar como enviada',
                exact: true,
            })
        ).not.toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
        ).not.toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'Confirmar cancelamento',
                exact: true,
            })
        ).not.toBeVisible();

        await expect(page).toHaveURL(invoiceUrl);
    });
});
