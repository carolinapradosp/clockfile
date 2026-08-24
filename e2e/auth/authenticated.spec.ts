import { expect, test } from '@playwright/test';

test.use({
    storageState: {
        cookies: [],
        origins: [],
    },
});

const TEST_USER = {
    email: 'e2e@clockfile.test',
    password: 'Teste123',
};

test.describe('Sessão autenticada', () => {
    test('usuário consegue encerrar a sessão e perde acesso às rotas protegidas', async ({
        page,
    }) => {
        await page.goto('/');

        await page.locator('input[name="email"]').fill(TEST_USER.email);
        await page.locator('input[name="password"]').fill(TEST_USER.password);

        await page
            .getByRole('button', {
                name: 'Entrar',
                exact: true,
            })
            .click();

        await expect(page).toHaveURL(/\/dashboard$/, {
            timeout: 15_000,
        });

        const logoutButton = page.getByRole('button', {
            name: 'Sair da conta',
            exact: true,
        });

        await expect(logoutButton).toBeVisible();

        await logoutButton.click();

        await expect
            .poll(() => new URL(page.url()).pathname, {
                timeout: 15_000,
            })
            .toBe('/');

        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();

        await page.goto('/dashboard');

        await expect
            .poll(() => new URL(page.url()).pathname, {
                timeout: 15_000,
            })
            .toBe('/');

        await expect(
            page.getByRole('heading', {
                name: /Olá,/i,
                level: 1,
            })
        ).toHaveCount(0);
    });
});
