import { expect, test } from '@playwright/test';

test.use({
    storageState: {
        cookies: [],
        origins: [],
    },
});

const protectedRoutes = ['/dashboard', '/projetos', '/relatorios', '/faturas', '/configuracoes'];

test('rotas protegidas redirecionam usuário não autenticado para o login', async ({ page }) => {
    for (const route of protectedRoutes) {
        await page.goto(route);

        await expect
            .poll(() => new URL(page.url()).pathname, {
                timeout: 15_000,
            })
            .toBe('/');

        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
    }
});
