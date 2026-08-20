import { expect, test } from '@playwright/test';

const TEST_USER = {
    email: 'e2e@clockfile.test',
    password: 'Teste123',
};

test.describe('Login', () => {
    test('usuário consegue fazer login com credenciais válidas', async ({ page }) => {
        await page.goto('/');

        await page.locator('input[name="email"]').fill(TEST_USER.email);

        await page.locator('input[name="password"]').fill(TEST_USER.password);

        const submitButton = page.getByRole('button', {
            name: 'Entrar',
            exact: true,
        });

        await expect(submitButton).toBeEnabled();

        await submitButton.click();

        await expect(page).toHaveURL(/\/dashboard$/, {
            timeout: 15_000,
        });

        await expect(page).not.toHaveURL('/');

        await expect(page.getByText(/Olá,/i)).toBeVisible();
    });

    test('não permite login com senha incorreta', async ({ page }) => {
        await page.goto('/');

        await page.locator('input[name="email"]').fill(TEST_USER.email);

        await page.locator('input[name="password"]').fill('SenhaErrada123');

        await page
            .getByRole('button', {
                name: 'Entrar',
                exact: true,
            })
            .click();

        await expect(
            page.getByText('E-mail ou senha inválidos.', {
                exact: true,
            })
        ).toBeVisible();

        await expect(page).toHaveURL('/');
    });

    test('não permite login com e-mail inexistente', async ({ page }) => {
        await page.goto('/');

        await page.locator('input[name="email"]').fill(`inexistente-${Date.now()}@clockfile.test`);

        await page.locator('input[name="password"]').fill(TEST_USER.password);

        await page
            .getByRole('button', {
                name: 'Entrar',
                exact: true,
            })
            .click();

        /*
         * A mensagem deve ser a mesma usada
         * para senha incorreta, evitando revelar
         * se determinado e-mail existe.
         */
        await expect(
            page.getByText('E-mail ou senha inválidos.', {
                exact: true,
            })
        ).toBeVisible();

        await expect(page).toHaveURL('/');
    });

    test('campos de e-mail e senha são obrigatórios', async ({ page }) => {
        await page.goto('/');

        const emailInput = page.locator('input[name="email"]');

        const passwordInput = page.locator('input[name="password"]');

        await expect(emailInput).toHaveAttribute('required', '');

        await expect(passwordInput).toHaveAttribute('required', '');

        await expect(emailInput).toHaveAttribute('type', 'email');

        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('usuário consegue exibir e ocultar a senha', async ({ page }) => {
        await page.goto('/');

        const passwordInput = page.locator('input[name="password"]');

        await expect(passwordInput).toHaveAttribute('type', 'password');

        await page
            .getByRole('button', {
                name: 'Mostrar senha',
                exact: true,
            })
            .click();

        await expect(passwordInput).toHaveAttribute('type', 'text');

        await page
            .getByRole('button', {
                name: 'Ocultar senha',
                exact: true,
            })
            .click();

        await expect(passwordInput).toHaveAttribute('type', 'password');
    });
});
