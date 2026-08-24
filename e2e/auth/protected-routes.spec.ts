//e2e/auth/protected-routes.spec.ts
import { expect, test } from '@playwright/test';

test.use({
    storageState: {
        cookies: [],
        origins: [],
    },
});

const protectedRoutes = ['/dashboard', '/projetos', '/relatorios', '/faturas', '/configuracoes'];

test.describe('Rotas protegidas', () => {
    for (const route of protectedRoutes) {
        test(`redireciona usuário não autenticado de ${route} para o login`, async ({ page }) => {
            await page.goto(route);

            await expect
                .poll(() => new URL(page.url()).pathname, {
                    timeout: 15_000,
                })
                .toBe('/');

            await expect(page.locator('input[name="email"]')).toBeVisible();

            await expect(page.locator('input[name="password"]')).toBeVisible();

            await expect(
                page.getByRole('button', {
                    name: 'Entrar',
                    exact: true,
                })
            ).toBeVisible();
        });
    }
});
