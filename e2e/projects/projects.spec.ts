import { expect, test } from '@playwright/test';

test.describe('Projetos', () => {
    test('usuário consegue criar um projeto', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto E2E ${timestamp}`;

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

        await expect(page).toHaveURL(/\/projetos\/[^/]+$/, {
            timeout: 15_000,
        });

        await expect(
            page.getByText(projectName, {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText('Ativo', {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('link', {
                name: /editar/i,
            })
        ).toBeVisible();
    });
});
