import { expect, test } from '@playwright/test';

test.describe('Projetos', () => {
    test('usuário consegue criar e editar um projeto', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto E2E ${timestamp}`;

        const updatedProjectName = `Projeto E2E Editado ${timestamp}`;

        /*
         * CRIAÇÃO
         */

        await page.goto('/projetos/novo');

        await expect(page).toHaveURL(/\/projetos\/novo$/);

        await page.locator('input[name="name"]').fill(projectName);

        await page
            .locator('textarea[name="description"]')
            .fill('Projeto criado automaticamente pelo Playwright.');

        await page.locator('select[name="status"]').selectOption('active');

        await page.locator('select[name="currency"]').selectOption('BRL');

        await page.locator('input[name="defaultHourlyRate"]').fill('150');

        const createButton = page.getByRole('button', {
            name: 'Cadastrar projeto',
            exact: true,
        });

        await expect(createButton).toBeEnabled();

        await createButton.click();

        /*
         * A Server Action redireciona para
         * /projetos/:id após a criação.
         */
        await expect(page).toHaveURL(/\/projetos\/[^/]+$/, {
            timeout: 15_000,
        });

        /*
         * Confirma que estamos visualizando
         * o projeto recém-criado.
         */
        await expect(
            page.getByText(projectName, {
                exact: true,
            })
        ).toBeVisible();

        /*
         * Guarda a URL para conseguirmos
         * validar que continuamos trabalhando
         * com o mesmo projeto.
         */
        const projectUrl = page.url();

        /*
         * EDIÇÃO
         *
         * Localizamos o link pelo comportamento
         * visível em vez de depender da estrutura
         * interna da página.
         */
        const editLink = page.getByRole('link', {
            name: /editar/i,
        });

        await expect(editLink).toBeVisible();

        await editLink.click();

        await expect(page).toHaveURL(/\/projetos\/[^/]+\/editar$/);

        /*
         * Os dados existentes devem ser
         * carregados no formulário.
         */
        await expect(page.locator('input[name="name"]')).toHaveValue(projectName);

        await expect(page.locator('select[name="currency"]')).toHaveValue('BRL');

        await expect(page.locator('input[name="defaultHourlyRate"]')).toHaveValue('150');

        /*
         * Altera alguns dados.
         */
        await page.locator('input[name="name"]').fill(updatedProjectName);

        await page
            .locator('textarea[name="description"]')
            .fill('Projeto atualizado automaticamente pelo Playwright.');

        await page.locator('input[name="defaultHourlyRate"]').fill('175');

        const saveButton = page.getByRole('button', {
            name: 'Salvar alterações',
            exact: true,
        });

        await expect(saveButton).toBeEnabled();

        await saveButton.click();

        /*
         * O formulário deve retornar para
         * a página do projeto.
         */
        await expect(page).toHaveURL(projectUrl, {
            timeout: 15_000,
        });

        /*
         * Confirma que a alteração realmente
         * foi persistida.
         */
        await expect(
            page.getByText(updatedProjectName, {
                exact: true,
            })
        ).toBeVisible();
    });
});
