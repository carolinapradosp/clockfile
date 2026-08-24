//e2e/auth/authenticated.spec.ts
import { expect, test } from '@playwright/test';

test.describe('Sessão autenticada', () => {
    test('sessão autenticada permite acessar o dashboard', async ({ page }) => {
        await page.goto('/dashboard');

        await expect(page).toHaveURL(/\/dashboard$/);

        await expect(page.getByText(/Olá,/i)).toBeVisible();
    });

    test('usuário consegue encerrar a sessão e perde acesso às rotas protegidas', async ({
        page,
    }) => {
        /*
         * =====================================================
         * 1. ACESSA UMA ROTA PROTEGIDA AUTENTICADO
         * =====================================================
         */

        await page.goto('/dashboard');

        await expect(page).toHaveURL(/\/dashboard$/, {
            timeout: 15_000,
        });

        await expect(
            page.getByRole('heading', {
                name: /Olá,/i,
                level: 1,
            })
        ).toBeVisible();

        /*
         * =====================================================
         * 2. FAZ LOGOUT
         * =====================================================
         */

        const logoutButton = page.getByRole('button', {
            name: 'Sair da conta',
            exact: true,
        });

        await expect(logoutButton).toBeVisible();

        await logoutButton.click();

        /*
         * handleLogout() remove a sessão e redireciona para "/".
         */
        await expect
            .poll(() => new URL(page.url()).pathname, {
                timeout: 15_000,
            })
            .toBe('/');

        /*
         * A página de login deve estar disponível novamente.
         */
        await expect(page.locator('input[name="email"]')).toBeVisible();

        await expect(page.locator('input[name="password"]')).toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'Entrar',
                exact: true,
            })
        ).toBeVisible();

        /*
         * =====================================================
         * 3. CONFIRMA QUE A SESSÃO FOI REALMENTE ENCERRADA
         * =====================================================
         *
         * Não basta validar o redirect.
         * Tentamos acessar novamente uma rota protegida.
         */

        await page.goto('/dashboard');

        await expect
            .poll(() => new URL(page.url()).pathname, {
                timeout: 15_000,
            })
            .toBe('/');

        await expect(page.locator('input[name="email"]')).toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'Entrar',
                exact: true,
            })
        ).toBeVisible();

        /*
         * O conteúdo autenticado não pode mais aparecer.
         */
        await expect(
            page.getByRole('heading', {
                name: /Olá,/i,
                level: 1,
            })
        ).toHaveCount(0);
    });
});
