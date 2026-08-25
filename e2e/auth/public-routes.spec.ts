import { expect, test } from '@playwright/test';

test('rotas públicas redirecionam usuário autenticado para o dashboard', async ({ page }) => {
    for (const route of ['/', '/cadastro']) {
        await page.goto(route);

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
    }
});
