import { expect, test, type Page } from '@playwright/test';

import {
    createDraftInvoice,
    createProject,
    createReportEntry,
    selectOptionByLabel,
} from '../helpers/e2e-helpers';

async function confirmModalAction({
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

    await expect(dialog).toBeHidden({
        timeout,
    });
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

        const issueButton = page.getByRole('button', {
            name: 'Emitir fatura',
            exact: true,
        });

        await expect(issueButton).toBeVisible();

        await issueButton.click();

        const issueDialog = page.getByRole('dialog');

        await expect(issueDialog).toBeVisible();

        await confirmModalAction({
            page,
            confirmButtonName: 'Emitir fatura',
        });

        await expect(
            page.getByRole('button', {
                name: 'Cancelar',
                exact: true,
            })
        ).toBeVisible({
            timeout: 15_000,
        });

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

        await confirmModalAction({
            page,
            confirmButtonName: 'Confirmar cancelamento',
        });

        await expect(
            page.getByRole('button', {
                name: 'Cancelar',
                exact: true,
            })
        ).toHaveCount(0, {
            timeout: 15_000,
        });

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

        await page.goto(`/faturas/${invoiceId}/editar`, {
            waitUntil: 'networkidle',
        });

        const saveDraftButton = page.getByRole('button', {
            name: 'Salvar rascunho',
            exact: true,
        });

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

        const issueButton = page.getByRole('button', {
            name: 'Emitir fatura',
            exact: true,
        });

        await expect(issueButton).toBeVisible();

        await issueButton.click();

        const issueDialog = page.getByRole('dialog');

        await expect(issueDialog).toBeVisible();

        await confirmModalAction({
            page,
            confirmButtonName: 'Emitir fatura',
        });

        await expect(
            page.getByRole('button', {
                name: 'Marcar como paga',
                exact: true,
            })
        ).toBeVisible({
            timeout: 15_000,
        });

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

        await confirmModalAction({
            page,
            confirmButtonName: 'Marcar como paga',
        });

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

        await page.goto(`/faturas/${invoiceId}/editar`, {
            waitUntil: 'networkidle',
        });

        const saveDraftButton = page.getByRole('button', {
            name: 'Salvar rascunho',
            exact: true,
        });

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
        test.setTimeout(60_000);

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

        await expect(duplicateAlert).toBeVisible({
            timeout: 15_000,
        });

        await expect(duplicateAlert).toContainText(
            'Já existe uma fatura cadastrada para este projeto',
            {
                timeout: 15_000,
            }
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

        await confirmModalAction({
            page,
            confirmButtonName: 'Emitir fatura',
        });

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

        await confirmModalAction({
            page,
            confirmButtonName: 'Marcar como enviada',
        });

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

        await confirmModalAction({
            page,
            confirmButtonName: 'Marcar como paga',
        });

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

        await confirmModalAction({
            page,
            confirmButtonName: 'Emitir fatura',
        });

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

        await confirmModalAction({
            page,
            confirmButtonName: 'Marcar como enviada',
        });

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

        await confirmModalAction({
            page,
            confirmButtonName: 'Marcar como vencida',
        });

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

        await confirmModalAction({
            page,
            confirmButtonName: 'Marcar como paga',
        });

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

        await confirmModalAction({
            page,
            confirmButtonName: 'Emitir fatura',
        });

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

        await confirmModalAction({
            page,
            confirmButtonName: 'Marcar como enviada',
        });

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

        await confirmModalAction({
            page,
            confirmButtonName: 'Marcar como vencida',
        });

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

        await confirmModalAction({
            page,
            confirmButtonName: 'Reenviada ao cliente',
        });

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

        const issueButton = page.getByRole('button', {
            name: 'Emitir fatura',
            exact: true,
        });

        await expect(issueButton).toBeVisible();

        await issueButton.click();

        const issueDialog = page.getByRole('dialog');

        await expect(issueDialog).toBeVisible();

        await confirmModalAction({
            page,
            confirmButtonName: 'Emitir fatura',
        });

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
        ).toHaveCount(0);

        await page.goto(`/faturas/${invoiceId}/editar`);

        await expect(page).toHaveURL(invoiceUrl, {
            timeout: 20_000,
        });

        /*
         * A rota de edição deve redirecionar automaticamente
         * para o detalhe quando a fatura não está mais em rascunho.
         *
         * Não fazemos outro page.goto(invoiceUrl), porque isso
         * criaria duas navegações concorrentes para a mesma página.
         */

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

        await expect(
            page.getByRole('button', {
                name: 'Emitir fatura',
                exact: true,
            })
        ).toHaveCount(0);
    });
});
