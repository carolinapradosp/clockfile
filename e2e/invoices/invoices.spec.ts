import { expect, test, type Page } from '@playwright/test';

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

    await page.locator('select[name="projectId"]').selectOption({
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

    await page.locator('#invoice-project').selectOption({
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

        /*
         * =====================================================
         * 1. CRIA O PROJETO
         * =====================================================
         */

        await createProject({
            page,
            projectName,
            recipientName,
            recipientEmail,
        });

        /*
         * =====================================================
         * 2. CRIA O LANÇAMENTO
         * =====================================================
         */

        await createReportEntry({
            page,
            projectName,
            taskName,
            date: today,
        });

        /*
         * =====================================================
         * 3. ABRE NOVA FATURA
         * =====================================================
         */

        await page.goto('/faturas/novo');

        const projectSelect = page.locator('#invoice-project');

        await projectSelect.selectOption({
            label: projectName,
        });

        const projectId = await projectSelect.inputValue();

        /*
         * =====================================================
         * 4. VALIDA DADOS AUTOMÁTICOS DO PROJETO
         * =====================================================
         */

        await expect(page.locator('input[name="billToName"]')).toHaveValue(recipientName);

        await expect(page.locator('input[name="billToEmail"]')).toHaveValue(recipientEmail);

        await expect(page.locator('select[name="billToCountryCode"]')).toHaveValue('BR');

        /*
         * =====================================================
         * 5. IMPORTA HORAS
         * =====================================================
         */

        const importButton = page.getByRole('button', {
            name: 'Importar horas do mês',
            exact: true,
        });

        await expect(importButton).toBeEnabled();

        await importButton.click();

        await expect(
            page.getByText(/lançamento\(s\) foram importados para a fatura/i)
        ).toBeVisible();

        /*
         * 02:00 × R$ 200 =
         * R$ 400,00.
         */

        const summaryCard = page
            .getByText('Subtotal', {
                exact: true,
            })
            .locator('xpath=ancestor::div[contains(@class,"rounded-2xl")]');

        const summaryAmounts = summaryCard.getByText(/400,00/);

        await expect(summaryAmounts).toHaveCount(2);

        /*
         * =====================================================
         * 6. SALVA RASCUNHO
         * =====================================================
         */

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
            const alert = page.getByRole('alert');

            if (await alert.isVisible()) {
                console.error('Erro ao salvar fatura:', await alert.textContent());
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

        /*
         * =====================================================
         * 7. CONFIRMA RASCUNHO
         * =====================================================
         */

        await expect(
            page.getByText('Ainda não emitida', {
                exact: true,
            })
        ).toBeVisible();

        /*
         * =====================================================
         * 8. EDITA
         * =====================================================
         */

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

        /*
         * =====================================================
         * 9. EDITA NOVAMENTE E EMITE
         * =====================================================
         */

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

        /*
         * =====================================================
         * 10. CONFIRMA EMISSÃO
         * =====================================================
         */

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

        const recipientA = 'Cliente Projeto Alpha';

        const recipientB = 'Cliente Projeto Beta';

        /*
         * Fixamos um mês dentro
         * do teste.
         *
         * A data do lançamento
         * deve pertencer ao mesmo mês.
         */

        const referenceMonth = '2026-07';

        const reportDate = '2026-07-15';

        /*
         * =====================================================
         * 1. CRIA PROJETO A
         * =====================================================
         */

        await createProject({
            page,

            projectName: projectA,

            recipientName: recipientA,

            recipientEmail: `alpha-${timestamp}@clockfile.test`,
        });

        /*
         * Cria lançamento para
         * Projeto A.
         */

        await createReportEntry({
            page,

            projectName: projectA,

            taskName: `Tarefa Alpha ${timestamp}`,

            date: reportDate,
        });

        /*
         * =====================================================
         * 2. CRIA PROJETO B
         * =====================================================
         */

        await createProject({
            page,

            projectName: projectB,

            recipientName: recipientB,

            recipientEmail: `beta-${timestamp}@clockfile.test`,
        });

        /*
         * Cria lançamento para
         * Projeto B.
         */

        await createReportEntry({
            page,

            projectName: projectB,

            taskName: `Tarefa Beta ${timestamp}`,

            date: reportDate,
        });

        /*
         * =====================================================
         * 3. FATURA PROJETO A
         * =====================================================
         */

        const invoiceAUrl = await createDraftInvoice({
            page,

            projectName: projectA,

            referenceMonth,
        });

        expect(new URL(invoiceAUrl).pathname).toMatch(/^\/faturas\/[0-9a-f-]+$/i);

        /*
         * =====================================================
         * 4. FATURA PROJETO B NO MESMO MÊS
         * =====================================================
         *
         * Deve ser permitido.
         */

        const invoiceBUrl = await createDraftInvoice({
            page,

            projectName: projectB,

            referenceMonth,
        });

        expect(new URL(invoiceBUrl).pathname).toMatch(/^\/faturas\/[0-9a-f-]+$/i);

        /*
         * As duas faturas devem ser
         * registros diferentes.
         */

        expect(invoiceAUrl).not.toBe(invoiceBUrl);

        /*
         * =====================================================
         * 5. CRIA NOVO LANÇAMENTO NO PROJETO A
         * =====================================================
         *
         * O primeiro lançamento já está
         * vinculado à primeira fatura.
         *
         * Criamos outro para garantir
         * que a segunda tentativa consiga
         * importar horas e chegue até a
         * validação de duplicidade da fatura.
         */

        await createReportEntry({
            page,

            projectName: projectA,

            taskName: `Segunda Tarefa Alpha ${timestamp}`,

            date: '2026-07-20',

            duration: '01:00',
        });

        /*
         * =====================================================
         * 6. TENTA CRIAR OUTRA FATURA
         *    PROJETO A + MESMO MÊS
         * =====================================================
         */

        await page.goto('/faturas/novo');

        await page.locator('#invoice-project').selectOption({
            label: projectA,
        });

        await page.locator('#reference-month').fill(referenceMonth);

        const importButton = page.getByRole('button', {
            name: 'Importar horas do mês',
            exact: true,
        });

        await expect(importButton).toBeEnabled();

        await importButton.click();

        /*
         * O novo lançamento deve
         * estar disponível.
         */

        await expect(
            page.getByText(/lançamento\(s\) foram importados para a fatura/i)
        ).toBeVisible();

        /*
         * Agora tenta salvar.
         */

        await page
            .getByRole('button', {
                name: 'Salvar rascunho',
                exact: true,
            })
            .click();

        /*
         * A aplicação deve continuar
         * na página de criação.
         */

        await expect(page).toHaveURL(/\/faturas\/novo$/, {
            timeout: 15_000,
        });

        /*
         * E deve apresentar um erro
         * ao usuário.
         *
         * Não amarramos o teste ao texto
         * exato da mensagem para que uma
         * mudança de copy não quebre a
         * regra de negócio testada.
         */

        const duplicateAlert = page.getByRole('alert').filter({
            hasText: 'Já existe uma fatura cadastrada para este projeto',
        });

        await expect(duplicateAlert).toBeVisible();

        await expect(duplicateAlert).toContainText(
            'Já existe uma fatura cadastrada para este projeto'
        );

        const errorMessage = await duplicateAlert.textContent();

        console.log('Mensagem de duplicidade:', errorMessage);
        /*
         * Confirma que nenhuma navegação
         * para uma terceira fatura ocorreu.
         */

        expect(new URL(page.url()).pathname).toBe('/faturas/novo');
    });
});
