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

        await expect(page.getByText(/Olá,/i)).toBeVisible();
    });

    test('não permite login com credenciais inválidas', async ({ page }) => {
        await page.goto('/');

        await page.locator('input[name="email"]').fill(TEST_USER.email);
        await page.locator('input[name="password"]').fill('SenhaErrada123');

        await page.getByRole('button', { name: 'Entrar', exact: true }).click();

        await expect(
            page.getByText('E-mail ou senha inválidos.', {
                exact: true,
            })
        ).toBeVisible();

        await expect(page).toHaveURL('/');
    });

    test('não revela se um e-mail inexistente está cadastrado', async ({ page }) => {
        await page.goto('/');

        await page.locator('input[name="email"]').fill(`inexistente-${Date.now()}@clockfile.test`);

        await page.locator('input[name="password"]').fill(TEST_USER.password);

        await page.getByRole('button', { name: 'Entrar', exact: true }).click();

        await expect(
            page.getByText('E-mail ou senha inválidos.', {
                exact: true,
            })
        ).toBeVisible();

        await expect(page).toHaveURL('/');
    });
});
