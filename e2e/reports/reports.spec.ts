import { expect, test } from '@playwright/test';

test.describe('Relatórios', () => {
    test('usuário consegue criar e editar um lançamento de horas', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Relatório E2E ${timestamp}`;

        const taskName = `Tarefa E2E ${timestamp}`;

        const updatedTaskName = `Tarefa E2E Editada ${timestamp}`;

        /*
         * =====================================================
         * 1. CRIA O PROJETO
         * =====================================================
         */

        await page.goto('/projetos/novo');

        await page.locator('input[name="name"]').fill(projectName);

        await page
            .locator('textarea[name="description"]')
            .fill('Projeto criado para testes E2E de lançamentos.');

        await page.locator('select[name="status"]').selectOption('active');

        await page.locator('select[name="currency"]').selectOption('BRL');

        await page.locator('input[name="defaultHourlyRate"]').fill('200');

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
         * 2. ABRE NOVO LANÇAMENTO
         * =====================================================
         */

        await page.goto('/relatorios/novo');

        await expect(page).toHaveURL(/\/relatorios\/novo$/);

        /*
         * =====================================================
         * 3. SELECIONA O PROJETO
         * =====================================================
         */

        const projectSelect = page.locator('select[name="projectId"]');

        await projectSelect.selectOption({
            label: projectName,
        });

        /*
         * =====================================================
         * 4. VALIDA O RATE AUTOMÁTICO
         * =====================================================
         */

        const rateInput = page.locator('input[name="rate"]');

        await expect(rateInput).toHaveValue('200');

        await expect(rateInput).toHaveAttribute('readonly', '');

        /*
         * =====================================================
         * 5. PREENCHE O LANÇAMENTO
         * =====================================================
         */

        await page.locator('input[name="task"]').fill(taskName);

        await page
            .locator('textarea[name="description"]')
            .fill('Implementação automatizada para teste E2E.');

        /*
         * 01:30 = 90 minutos.
         *
         * 1,5 hora × R$ 200 = R$ 300,00.
         */
        await page.locator('input[name="duration"]').fill('01:30');

        await expect(page.getByText(/90 minutos/i)).toBeVisible();

        await expect(page.getByText(/300,00/)).toBeVisible();

        /*
         * =====================================================
         * 6. SALVA O LANÇAMENTO
         * =====================================================
         */

        const saveButton = page.getByRole('button', {
            name: 'Salvar lançamento',
            exact: true,
        });

        await expect(saveButton).toBeEnabled();

        await saveButton.click();

        await expect(page).toHaveURL(/\/relatorios(?:\?.*)?$/, {
            timeout: 15_000,
        });

        /*
         * =====================================================
         * 7. CONFIRMA QUE APARECE NA LISTAGEM
         * =====================================================
         *
         * Na versão desktop, a tarefa é um link.
         */

        const taskLink = page.getByRole('link', {
            name: taskName,
            exact: true,
        });

        await expect(taskLink).toBeVisible();

        /*
         * Localiza especificamente a linha
         * desktop da tarefa criada.
         */
        const createdRow = page.getByRole('row').filter({
            has: taskLink,
        });

        await expect(createdRow).toBeVisible();

        await expect(
            createdRow.getByText('01:30', {
                exact: true,
            })
        ).toBeVisible();

        await expect(createdRow.getByText(/200,00/)).toBeVisible();

        await expect(createdRow.getByText(/300,00/)).toBeVisible();

        /*
         * =====================================================
         * 8. ABRE DIRETAMENTE A EDIÇÃO
         * =====================================================
         */

        const editLink = page.getByRole('link', {
            name: `Editar ${taskName}`,
            exact: true,
        });

        await expect(editLink).toBeVisible();

        await editLink.click();

        await expect(page).toHaveURL(/\/relatorios\/[^/]+\/editar$/);

        /*
         * =====================================================
         * 9. CONFIRMA OS DADOS CARREGADOS
         * =====================================================
         */

        const taskInput = page.locator('input[name="task"]');

        await expect(taskInput).toHaveValue(taskName);

        await expect(page.locator('input[name="rate"]')).toHaveValue('200');

        await expect(page.locator('input[name="rate"]')).toHaveAttribute('readonly', '');

        await expect(page.locator('input[name="duration"]')).toHaveValue('01:30');

        /*
         * =====================================================
         * 10. EDITA O LANÇAMENTO
         * =====================================================
         */

        await taskInput.fill(updatedTaskName);

        /*
         * 02:00 = 120 minutos.
         *
         * 2 horas × R$ 200 = R$ 400,00.
         */
        await page.locator('input[name="duration"]').fill('02:00');

        await expect(page.getByText(/120 minutos/i)).toBeVisible();

        await expect(page.getByText(/400,00/)).toBeVisible();

        /*
         * =====================================================
         * 11. SALVA A EDIÇÃO
         * =====================================================
         */

        const updateButton = page.getByRole('button', {
            name: 'Salvar alterações',
            exact: true,
        });

        await expect(updateButton).toBeEnabled();

        await updateButton.click();

        await expect(page).toHaveURL(/\/relatorios(?:\?.*)?$/, {
            timeout: 15_000,
        });

        /*
         * =====================================================
         * 12. CONFIRMA A ALTERAÇÃO
         * =====================================================
         */

        const updatedTaskLink = page.getByRole('link', {
            name: updatedTaskName,
            exact: true,
        });

        await expect(updatedTaskLink).toBeVisible();

        /*
         * Localiza a linha específica
         * do lançamento atualizado.
         */
        const updatedRow = page.getByRole('row').filter({
            has: updatedTaskLink,
        });

        await expect(updatedRow).toBeVisible();

        /*
         * Confirma a nova duração.
         */
        await expect(
            updatedRow.getByText('02:00', {
                exact: true,
            })
        ).toBeVisible();

        /*
         * Confirma que o rate
         * permaneceu R$ 200.
         */
        await expect(updatedRow.getByText(/200,00/)).toBeVisible();

        /*
         * Confirma o novo valor:
         * 2 × R$ 200 = R$ 400.
         */
        await expect(updatedRow.getByText(/400,00/)).toBeVisible();

        /*
         * Confirma também que o botão
         * de edição recebeu o novo nome.
         */
        await expect(
            page.getByRole('link', {
                name: `Editar ${updatedTaskName}`,
                exact: true,
            })
        ).toBeVisible();
    });
});
