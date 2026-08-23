//e2e/invoices/invoices.spec.ts

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
    const maxAttempts = 4;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        await expect(select).toBeVisible({
            timeout: 15_000,
        });

        const matchingOption = select.locator('option').filter({
            hasText: label,
        });

        if ((await matchingOption.count()) > 0) {
            const value = await matchingOption.first().getAttribute('value');

            expect(value).toBeTruthy();

            await select.selectOption(value!);

            await expect(select).toHaveValue(value!);

            return;
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
    test('fatura cancelada é terminal e não pode voltar para um status anterior', async ({
        page,
    }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Fatura Cancelada Terminal E2E ${timestamp}`;
        const taskName = `Tarefa Fatura Cancelada Terminal E2E ${timestamp}`;

        const referenceMonth = '2027-10';
        const reportDate = '2027-10-15';

        await createProject({
            page,
            projectName,
            recipientName: 'Cliente Fatura Cancelada',
            recipientEmail: `cancelada-terminal-${timestamp}@clockfile.test`,
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

        const invoicePath = new URL(invoiceUrl).pathname;

        const invoiceId = invoicePath.split('/').filter(Boolean).at(-1);

        expect(invoiceId).toBeTruthy();

        /*
         * =====================================================
         * 1. EMITE A FATURA
         * =====================================================
         */

        const issueButton = page.getByRole('button', {
            name: 'Emitir fatura',
            exact: true,
        });

        await expect(issueButton).toBeVisible();

        await issueButton.click();

        const issueDialog = page.getByRole('dialog');

        await expect(issueDialog).toBeVisible();

        await issueDialog
            .getByRole('button', {
                name: 'Emitir fatura',
                exact: true,
            })
            .click();

        await expect(
            page.getByRole('button', {
                name: 'Cancelar',
                exact: true,
            })
        ).toBeVisible({
            timeout: 15_000,
        });

        /*
         * =====================================================
         * 2. CANCELA A FATURA
         * =====================================================
         */

        await page
            .getByRole('button', {
                name: 'Cancelar',
                exact: true,
            })
            .click();

        const cancelDialog = page.getByRole('dialog');

        await expect(cancelDialog).toBeVisible();

        await expect(
            cancelDialog.getByText(/Deseja cancelar esta fatura\?/, {
                exact: false,
            })
        ).toBeVisible();

        await cancelDialog
            .getByRole('button', {
                name: 'Confirmar cancelamento',
                exact: true,
            })
            .click();

        /*
         * Aguarda o refresh após a Server Action.
         */
        await expect(
            page.getByRole('button', {
                name: 'Cancelar',
                exact: true,
            })
        ).toHaveCount(0, {
            timeout: 15_000,
        });

        /*
         * =====================================================
         * 3. CANCELLED NÃO POSSUI TRANSIÇÕES DE SAÍDA
         * =====================================================
         */

        await expect(
            page.getByRole('button', {
                name: 'Emitir fatura',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Marcar como enviada',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Marcar como vencida',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Reenviada ao cliente',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Cancelar',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('link', {
                name: 'Editar',
                exact: true,
            })
        ).toHaveCount(0);

        /*
         * =====================================================
         * 4. TENTA CONTORNAR A UI PELA URL DE EDIÇÃO
         * =====================================================
         */

        await page.goto(`/faturas/${invoiceId}/editar`, {
            waitUntil: 'networkidle',
        });

        const saveDraftButton = page.getByRole('button', {
            name: 'Salvar rascunho',
            exact: true,
        });

        /*
         * Se a rota permitir abrir o formulário, a proteção
         * definitiva deve vir do saveInvoice().
         */
        if (await saveDraftButton.isVisible()) {
            const notesInput = page.locator('#invoice-notes');

            if (await notesInput.isVisible()) {
                await notesInput.fill('Tentativa de editar uma fatura cancelada.');
            }

            await saveDraftButton.click();

            const errorAlert = page.getByRole('alert').filter({
                hasText: 'Somente faturas em rascunho podem ser editadas.',
            });

            await expect(errorAlert).toBeVisible({
                timeout: 15_000,
            });
        }

        /*
         * =====================================================
         * 5. CONFIRMA QUE A FATURA CONTINUA CANCELADA
         * =====================================================
         */

        await page.goto(invoiceUrl, {
            waitUntil: 'networkidle',
        });

        await expect(page).toHaveURL(invoiceUrl);

        await expect(
            page.getByRole('button', {
                name: 'Emitir fatura',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Marcar como enviada',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Cancelar',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('link', {
                name: 'Editar',
                exact: true,
            })
        ).toHaveCount(0);
    });

    test('fatura paga é terminal e não pode voltar para um status anterior', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Fatura Terminal E2E ${timestamp}`;
        const taskName = `Tarefa Fatura Terminal E2E ${timestamp}`;

        const referenceMonth = '2027-09';
        const reportDate = '2027-09-15';

        await createProject({
            page,
            projectName,
            recipientName: 'Cliente Fatura Terminal',
            recipientEmail: `terminal-${timestamp}@clockfile.test`,
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

        const invoicePath = new URL(invoiceUrl).pathname;

        const invoiceId = invoicePath.split('/').filter(Boolean).at(-1);

        expect(invoiceId).toBeTruthy();

        /*
         * =====================================================
         * 1. EMITE A FATURA
         * =====================================================
         */

        const issueButton = page.getByRole('button', {
            name: 'Emitir fatura',
            exact: true,
        });

        await expect(issueButton).toBeVisible();

        await issueButton.click();

        const issueDialog = page.getByRole('dialog');

        await expect(issueDialog).toBeVisible();

        await issueDialog
            .getByRole('button', {
                name: 'Emitir fatura',
                exact: true,
            })
            .click();

        await expect(
            page.getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
        ).toBeVisible({
            timeout: 15_000,
        });

        /*
         * =====================================================
         * 2. MARCA A FATURA COMO PAGA
         * =====================================================
         */

        await page
            .getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
            .click();

        const paidDialog = page.getByRole('dialog');

        await expect(paidDialog).toBeVisible();

        await expect(
            paidDialog.getByText('Confirma o recebimento integral desta fatura?', {
                exact: true,
            })
        ).toBeVisible();

        await paidDialog
            .getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
            .click();

        /*
         * Aguarda a atualização da página após a Server Action.
         */
        await expect(
            page.getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
        ).toHaveCount(0, {
            timeout: 15_000,
        });

        /*
         * =====================================================
         * 3. PAID NÃO POSSUI TRANSIÇÕES DE SAÍDA
         * =====================================================
         */

        await expect(
            page.getByRole('button', {
                name: 'Emitir fatura',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Marcar como enviada',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Marcar como vencida',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Reenviada ao cliente',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Cancelar',
                exact: true,
            })
        ).toHaveCount(0);

        /*
         * A edição também não deve mais ser oferecida.
         */
        await expect(
            page.getByRole('link', {
                name: 'Editar',
                exact: true,
            })
        ).toHaveCount(0);

        /*
         * =====================================================
         * 4. TENTA CONTORNAR A UI PELA URL DE EDIÇÃO
         * =====================================================
         */

        await page.goto(`/faturas/${invoiceId}/editar`, {
            waitUntil: 'networkidle',
        });

        const saveDraftButton = page.getByRole('button', {
            name: 'Salvar rascunho',
            exact: true,
        });

        /*
         * Há duas implementações aceitáveis:
         *
         * 1. a rota de edição já redireciona/bloqueia;
         * 2. o formulário abre, mas saveInvoice rejeita porque
         *    somente faturas draft podem ser editadas.
         */
        if (await saveDraftButton.isVisible()) {
            const notesInput = page.locator('#invoice-notes');

            if (await notesInput.isVisible()) {
                await notesInput.fill('Tentativa de retornar uma fatura paga para rascunho.');
            }

            await saveDraftButton.click();

            const errorAlert = page.getByRole('alert').filter({
                hasText: 'Somente faturas em rascunho podem ser editadas.',
            });

            await expect(errorAlert).toBeVisible({
                timeout: 15_000,
            });
        }

        /*
         * =====================================================
         * 5. CONFIRMA QUE A FATURA CONTINUA TERMINAL
         * =====================================================
         */

        await page.goto(invoiceUrl, {
            waitUntil: 'networkidle',
        });

        await expect(page).toHaveURL(invoiceUrl);

        await expect(
            page.getByRole('button', {
                name: 'Emitir fatura',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Marcar como enviada',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Cancelar',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('link', {
                name: 'Editar',
                exact: true,
            })
        ).toHaveCount(0);

        /*
         * Se a tentativa de edição tivesse conseguido voltar
         * a fatura para draft, o botão "Emitir fatura"
         * apareceria novamente. Portanto sua ausência também
         * comprova que o status terminal foi preservado.
         */
    });

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

        await page.goto('/faturas/novo', {
            waitUntil: 'networkidle',
        });

        const projectSelect = page.locator('#invoice-project');

        await selectOptionByLabel({
            page,
            select: projectSelect,
            label: projectName,
        });

        await expect(page.locator('input[name="billToName"]')).not.toHaveValue('', {
            timeout: 15_000,
        });

        await page.locator('#reference-month').fill(referenceMonth);

        const importButton = page.getByRole('button', {
            name: 'Importar horas do mês',
            exact: true,
        });

        await expect(importButton).toBeEnabled({
            timeout: 15_000,
        });

        await importButton.click();

        await expect(
            page.getByText(/1 lançamento\(s\) foram importados para a fatura/i)
        ).toBeVisible({
            timeout: 15_000,
        });

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
            const alert = page
                .getByRole('alert')
                .filter({
                    hasText: /.+/,
                })
                .first();

            if (await alert.isVisible()) {
                console.error('Erro ao recriar fatura após exclusão:', await alert.textContent());
            }

            throw error;
        }

        expect(new URL(page.url()).pathname).toMatch(
            /^\/faturas\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );

        await expect(
            page.getByText('1 lançamento vinculado', {
                exact: true,
            })
        ).toBeVisible({
            timeout: 15_000,
        });
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

    test('lançamento já faturado não fica disponível para importação em outra fatura', async ({
        page,
    }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Importação Única Fatura E2E ${timestamp}`;
        const taskName = `Tarefa Importação Única Fatura E2E ${timestamp}`;
        const referenceMonth = '2026-12';
        const reportDate = '2026-12-15';

        await createProject({
            page,
            projectName,
            recipientName: 'Cliente Importação Única Automatizado',
            recipientEmail: `importacao-unica-${timestamp}@clockfile.test`,
        });

        await createReportEntry({
            page,
            projectName,
            taskName,
            date: reportDate,
        });

        const firstInvoiceUrl = await createDraftInvoice({
            page,
            projectName,
            referenceMonth,
        });

        await expect(page).toHaveURL(firstInvoiceUrl);

        await expect(
            page.getByText('1 lançamento vinculado', {
                exact: true,
            })
        ).toBeVisible();

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

        await expect(
            page.getByText(taskName, {
                exact: true,
            })
        ).not.toBeVisible();

        await importButton.click();

        await expect(
            page.getByText(taskName, {
                exact: true,
            })
        ).not.toBeVisible();

        await expect(
            page.getByText(/lançamento\(s\) foram importados para a fatura/i)
        ).not.toBeVisible();

        await expect(page).toHaveURL(/\/faturas\/novo$/);
    });

    test('usuário consegue reenviar uma fatura vencida ao cliente', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Reenvio Fatura E2E ${timestamp}`;
        const taskName = `Tarefa Reenvio Fatura E2E ${timestamp}`;

        const referenceMonth = '2027-06';
        const reportDate = '2027-06-15';

        await createProject({
            page,
            projectName,
            recipientName: 'Cliente Reenvio Automatizado',
            recipientEmail: `reenvio-${timestamp}@clockfile.test`,
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

        await expect(issueButton).toBeVisible();

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

        const resendButton = page.getByRole('button', {
            name: 'Reenviada ao cliente',
            exact: true,
        });

        await expect(resendButton).toBeVisible({
            timeout: 15_000,
        });

        await expect(
            page.getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'Cancelar',
                exact: true,
            })
        ).toBeVisible();

        await resendButton.click();

        await expect(
            page.getByText('Deseja registrar esta fatura novamente como enviada?', {
                exact: true,
            })
        ).toBeVisible();

        const resendButtons = page.getByRole('button', {
            name: 'Reenviada ao cliente',
            exact: true,
        });

        await expect(resendButtons).toHaveCount(2);

        await resendButtons.last().click();

        await expect(
            page.getByRole('button', {
                name: 'Marcar como vencida',
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
        ).not.toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'Cancelar',
                exact: true,
            })
        ).toBeVisible();

        await expect(page).toHaveURL(invoiceUrl);
    });

    test('usuário consegue marcar uma fatura vencida como paga', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Fatura Vencida Paga E2E ${timestamp}`;
        const taskName = `Tarefa Fatura Vencida Paga E2E ${timestamp}`;

        const referenceMonth = '2027-07';
        const reportDate = '2027-07-15';

        await createProject({
            page,
            projectName,
            recipientName: 'Cliente Pagamento Atrasado',
            recipientEmail: `vencida-paga-${timestamp}@clockfile.test`,
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

        await expect(issueButton).toBeVisible();

        await issueButton.click();

        const issueDialog = page.getByRole('dialog');

        await expect(issueDialog).toBeVisible();

        await issueDialog
            .getByRole('button', {
                name: 'Emitir fatura',
                exact: true,
            })
            .click();

        await expect(
            page.getByRole('button', {
                name: 'Marcar como enviada',
                exact: true,
            })
        ).toBeVisible({
            timeout: 15_000,
        });

        await page
            .getByRole('button', {
                name: 'Marcar como enviada',
                exact: true,
            })
            .click();

        const sentDialog = page.getByRole('dialog');

        await expect(sentDialog).toBeVisible();

        await sentDialog
            .getByRole('button', {
                name: 'Marcar como enviada',
                exact: true,
            })
            .click();

        await expect(
            page.getByRole('button', {
                name: 'Marcar como vencida',
                exact: true,
            })
        ).toBeVisible({
            timeout: 15_000,
        });

        await page
            .getByRole('button', {
                name: 'Marcar como vencida',
                exact: true,
            })
            .click();

        const overdueDialog = page.getByRole('dialog');

        await expect(overdueDialog).toBeVisible();

        await expect(
            overdueDialog.getByText('Deseja marcar esta fatura como vencida?', {
                exact: true,
            })
        ).toBeVisible();

        await overdueDialog
            .getByRole('button', {
                name: 'Marcar como vencida',
                exact: true,
            })
            .click();

        await expect(
            page.getByRole('button', {
                name: 'Reenviada ao cliente',
                exact: true,
            })
        ).toBeVisible({
            timeout: 15_000,
        });

        const payButton = page.getByRole('button', {
            name: 'Marcar como paga',
            exact: true,
        });

        await expect(payButton).toBeVisible();

        await payButton.click();

        const paidDialog = page.getByRole('dialog');

        await expect(paidDialog).toBeVisible();

        await expect(
            paidDialog.getByText('Confirma o recebimento integral desta fatura?', {
                exact: true,
            })
        ).toBeVisible();

        await paidDialog
            .getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
            .click();

        await expect(
            page.getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
        ).toHaveCount(0, {
            timeout: 15_000,
        });

        await expect(
            page.getByRole('button', {
                name: 'Reenviada ao cliente',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Cancelar',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Marcar como vencida',
                exact: true,
            })
        ).toHaveCount(0);

        await expect(page).toHaveURL(invoiceUrl);
    });

    test('não permite editar uma fatura depois de emitida', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Bloqueio Edição Fatura E2E ${timestamp}`;
        const taskName = `Tarefa Bloqueio Edição Fatura E2E ${timestamp}`;

        const referenceMonth = '2027-08';
        const reportDate = '2027-08-15';

        await createProject({
            page,
            projectName,
            recipientName: 'Cliente Bloqueio Edição',
            recipientEmail: `bloqueio-edicao-${timestamp}@clockfile.test`,
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

        const invoicePath = new URL(invoiceUrl).pathname;

        const invoiceId = invoicePath.split('/').filter(Boolean).at(-1);

        expect(invoiceId).toBeTruthy();

        /*
         * =====================================================
         * 1. EMITE A FATURA
         * =====================================================
         */

        const issueButton = page.getByRole('button', {
            name: 'Emitir fatura',
            exact: true,
        });

        await expect(issueButton).toBeVisible();

        await issueButton.click();

        const issueDialog = page.getByRole('dialog');

        await expect(issueDialog).toBeVisible();

        await issueDialog
            .getByRole('button', {
                name: 'Emitir fatura',
                exact: true,
            })
            .click();

        /*
         * Depois da emissão, as ações disponíveis devem
         * ser as correspondentes ao status "issued".
         */

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

        /*
         * =====================================================
         * 2. A UI NÃO OFERECE MAIS EDIÇÃO
         * =====================================================
         */

        await expect(
            page.getByRole('link', {
                name: 'Editar',
                exact: true,
            })
        ).toHaveCount(0);

        /*
         * =====================================================
         * 3. TENTA BURLAR A UI ACESSANDO A URL DIRETAMENTE
         * =====================================================
         */

        await page.goto(`/faturas/${invoiceId}/editar`);

        /*
         * Caso a página de edição ainda seja renderizada,
         * a proteção definitiva continua sendo da action.
         *
         * Tentamos salvar a fatura novamente e esperamos
         * a rejeição do backend.
         */

        if (
            await page
                .getByRole('button', {
                    name: 'Salvar rascunho',
                    exact: true,
                })
                .isVisible()
        ) {
            const notesInput = page.locator('#invoice-notes');

            await expect(notesInput).toBeVisible();

            await notesInput.fill('Tentativa indevida de editar uma fatura já emitida.');

            await page
                .getByRole('button', {
                    name: 'Salvar rascunho',
                    exact: true,
                })
                .click();

            const errorAlert = page.getByRole('alert').filter({
                hasText: 'Somente faturas em rascunho podem ser editadas.',
            });

            await expect(errorAlert).toBeVisible({
                timeout: 15_000,
            });

            /*
             * A tentativa não pode navegar para outra fatura
             * nem transformar o status novamente em draft.
             */

            await page.goto(invoiceUrl);
        } else {
            /*
             * Se a própria página já impedir o acesso à edição,
             * voltamos para os detalhes para validar o estado.
             */

            await page.goto(invoiceUrl);
        }

        /*
         * =====================================================
         * 4. CONFIRMA QUE A FATURA CONTINUA EMITIDA
         * =====================================================
         */

        await expect(page).toHaveURL(invoiceUrl);

        await expect(
            page.getByText('Ainda não emitida', {
                exact: true,
            })
        ).toHaveCount(0);

        await expect(
            page.getByRole('button', {
                name: 'Marcar como enviada',
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('link', {
                name: 'Editar',
                exact: true,
            })
        ).toHaveCount(0);

        /*
         * Se saveInvoice tivesse conseguido voltar a fatura
         * para draft, "Emitir fatura" reapareceria.
         */

        await expect(
            page.getByRole('button', {
                name: 'Emitir fatura',
                exact: true,
            })
        ).toHaveCount(0);
    });
});
