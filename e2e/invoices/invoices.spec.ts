import { expect, test } from '@playwright/test';

test.describe('Faturas', () => {
    test('usuário consegue criar rascunho, editar e emitir uma fatura com horas importadas', async ({
        page,
    }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Fatura E2E ${timestamp}`;

        const taskName = `Tarefa Fatura E2E ${timestamp}`;

        /*
         * O nome do destinatário não pode conter números,
         * pois o InvoiceForm valida o nome com isValidName().
         */
        const recipientName = 'Cliente Teste Automatizado';

        const recipientEmail = `cliente-${timestamp}@clockfile.test`;

        /*
         * =====================================================
         * 1. CRIA O PROJETO
         * =====================================================
         */

        await page.goto('/projetos/novo');

        await page.locator('input[name="name"]').fill(projectName);

        await page
            .locator('textarea[name="description"]')
            .fill('Projeto criado para teste E2E de faturamento.');

        await page.locator('select[name="status"]').selectOption('active');

        await page.locator('select[name="currency"]').selectOption('BRL');

        await page.locator('input[name="defaultHourlyRate"]').fill('200');

        /*
         * Dados de faturamento do projeto.
         */

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

        /*
         * =====================================================
         * 2. CRIA O LANÇAMENTO
         * =====================================================
         */

        await page.goto('/relatorios/novo');

        await page.locator('select[name="projectId"]').selectOption({
            label: projectName,
        });

        await page.locator('input[name="task"]').fill(taskName);

        await page
            .locator('textarea[name="description"]')
            .fill('Lançamento criado para teste E2E de faturamento.');

        await page.locator('input[name="duration"]').fill('02:00');

        /*
         * O rate deve vir automaticamente do projeto.
         */

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
         * 5. IMPORTA AS HORAS DO MÊS
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
         * 02:00 × R$ 200 = R$ 400,00.
         *
         * Como imposto = 0:
         *
         * Subtotal = R$ 400,00
         * Total = R$ 400,00
         */

        const summaryCard = page
            .getByText('Subtotal', {
                exact: true,
            })
            .locator('xpath=ancestor::div[contains(@class,"rounded-2xl")]');

        await expect(summaryCard).toBeVisible();

        const summaryAmounts = summaryCard.getByText(/400,00/);

        await expect(summaryAmounts).toHaveCount(2);

        await expect(summaryAmounts.first()).toBeVisible();

        await expect(summaryAmounts.last()).toBeVisible();

        /*
         * =====================================================
         * 6. SALVA COMO RASCUNHO
         * =====================================================
         */

        await page
            .getByRole('button', {
                name: 'Salvar rascunho',
                exact: true,
            })
            .click();

        /*
         * Não usamos mais:
         *
         * /\/faturas\/[^/]+$/
         *
         * porque ela também aceita:
         *
         * /faturas/novo
         *
         * Primeiro esperamos sair explicitamente
         * da página de criação.
         */

        try {
            await expect(page).not.toHaveURL(/\/faturas\/novo$/, {
                timeout: 15_000,
            });
        } catch (error) {
            /*
             * Se alguma validação impedir o salvamento,
             * mostramos a mensagem retornada pelo formulário.
             */

            const alert = page.getByRole('alert');

            if (await alert.isVisible()) {
                console.error('Erro ao salvar fatura:', await alert.textContent());
            }

            throw error;
        }

        /*
         * Aguarda a página de detalhes terminar
         * de carregar.
         */

        await page.waitForLoadState('networkidle');

        const currentPath = new URL(page.url()).pathname;

        console.log('URL após salvar rascunho:', page.url());

        console.log('PATH após salvar rascunho:', currentPath);

        /*
         * A aplicação utiliza UUID como ID.
         *
         * Dessa forma garantimos que estamos realmente em:
         *
         * /faturas/:uuid
         *
         * e nunca em:
         *
         * /faturas/novo
         */

        expect(currentPath).toMatch(
            /^\/faturas\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );

        const invoiceId = currentPath.split('/').filter(Boolean).at(-1);

        expect(invoiceId).toBeTruthy();

        expect(invoiceId).not.toBe('novo');

        const invoiceUrl = page.url();

        /*
         * =====================================================
         * 7. CONFIRMA A PÁGINA DA FATURA
         * =====================================================
         */

        await expect(
            page.getByRole('link', {
                name: 'Voltar para faturas',
                exact: true,
            })
        ).toBeVisible({
            timeout: 15_000,
        });

        await expect(
            page.getByRole('heading', {
                name: /^Fatura #/,
            })
        ).toBeVisible({
            timeout: 15_000,
        });

        /*
         * Como foi salva como rascunho,
         * ainda não deve estar emitida.
         */

        await expect(
            page.getByText('Ainda não emitida', {
                exact: true,
            })
        ).toBeVisible();

        /*
         * =====================================================
         * 8. ABRE A EDIÇÃO DO RASCUNHO
         * =====================================================
         */

        await page.goto(`/faturas/${invoiceId}/editar`);

        await expect(page).toHaveURL(/\/faturas\/[^/]+\/editar$/, {
            timeout: 15_000,
        });

        /*
         * =====================================================
         * 9. VALIDA OS DADOS DO RASCUNHO
         * =====================================================
         */

        await expect(page.locator('#invoice-project')).toHaveValue(projectId);

        await expect(page.locator('input[name="billToName"]')).toHaveValue(recipientName);

        await expect(page.locator('input[name="billToEmail"]')).toHaveValue(recipientEmail);

        /*
         * =====================================================
         * 10. ALTERA E SALVA NOVAMENTE
         * =====================================================
         *
         * Esse trecho protege o bug em que os lançamentos
         * pertencentes à própria fatura eram tratados como
         * pertencentes a outra fatura.
         */

        const notes = 'Rascunho editado pelo teste E2E.';

        await page.locator('#invoice-notes').fill(notes);

        await page
            .getByRole('button', {
                name: 'Salvar rascunho',
                exact: true,
            })
            .click();

        /*
         * Se houver algum erro de vínculo,
         * a navegação não acontecerá.
         */

        try {
            await expect(page).toHaveURL(invoiceUrl, {
                timeout: 15_000,
            });
        } catch (error) {
            const alert = page.getByRole('alert');

            if (await alert.isVisible()) {
                console.error('Erro ao editar rascunho:', await alert.textContent());
            }

            throw error;
        }

        /*
         * Confirma persistência da observação.
         */

        await expect(
            page.getByText(notes, {
                exact: true,
            })
        ).toBeVisible();

        /*
         * =====================================================
         * 11. ABRE NOVAMENTE A EDIÇÃO
         * =====================================================
         */

        await page.goto(`/faturas/${invoiceId}/editar`);

        await expect(page).toHaveURL(/\/faturas\/[^/]+\/editar$/, {
            timeout: 15_000,
        });

        /*
         * Confirma que a alteração realmente
         * foi persistida no banco.
         */

        await expect(page.locator('#invoice-notes')).toHaveValue(notes);

        await expect(page.locator('#invoice-project')).toHaveValue(projectId);

        /*
         * =====================================================
         * 12. SALVA E EMITE
         * =====================================================
         */

        const emitButton = page.getByRole('button', {
            name: 'Salvar e emitir',
            exact: true,
        });

        await expect(emitButton).toBeEnabled();

        await emitButton.click();

        /*
         * Novamente fazemos diagnóstico do erro
         * caso a emissão não redirecione.
         */

        try {
            await expect(page).toHaveURL(invoiceUrl, {
                timeout: 15_000,
            });
        } catch (error) {
            const alert = page.getByRole('alert');

            if (await alert.isVisible()) {
                console.error('Erro ao emitir fatura:', await alert.textContent());
            }

            throw error;
        }

        /*
         * =====================================================
         * 13. CONFIRMA QUE A FATURA FOI EMITIDA
         * =====================================================
         */

        await expect(
            page.getByText('Ainda não emitida', {
                exact: true,
            })
        ).not.toBeVisible();

        /*
         * Uma fatura emitida não deve mais
         * apresentar a ação de edição.
         */

        await expect(
            page.getByRole('link', {
                name: 'Editar',
                exact: true,
            })
        ).not.toBeVisible();

        /*
         * =====================================================
         * 14. CONFIRMA QUE NÃO HOUVE ERRO DE VÍNCULO
         * =====================================================
         */

        await expect(
            page.getByText(/Um ou mais lançamentos selecionados já pertencem a outra fatura/i)
        ).not.toBeVisible();
    });
});
