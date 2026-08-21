import { expect, test } from '@playwright/test';

test.describe('Rotas públicas com usuário autenticado', () => {
    test('redireciona usuário autenticado da página de login para o dashboard', async ({
        page,
    }) => {
        await page.goto('/');

        await expect
            .poll(() => new URL(page.url()).pathname, {
                timeout: 15_000,
            })
            .toBe('/dashboard');

        await expect(
            page.getByRole('heading', {
                name: /Olá,/i,
                level: 1,
            })
        ).toBeVisible();
    });

    test('redireciona usuário autenticado da página de cadastro para o dashboard', async ({
        page,
    }) => {
        await page.goto('/cadastro');

        await expect
            .poll(() => new URL(page.url()).pathname, {
                timeout: 15_000,
            })
            .toBe('/dashboard');

        await expect(
            page.getByRole('heading', {
                name: /Olá,/i,
                level: 1,
            })
        ).toBeVisible();
    });
});
