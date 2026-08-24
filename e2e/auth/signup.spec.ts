//e2e/auth/signup.spec.ts
import { expect, test, type Page } from '@playwright/test';

test.use({
    storageState: {
        cookies: [],
        origins: [],
    },
});

async function waitForSignUpFormHydration(page: Page) {
    const passwordInput = page.locator('input[name="password"]');

    const togglePassword = page.getByRole('button', {
        name: 'Mostrar senha',
        exact: true,
    });

    await expect(togglePassword).toBeVisible();

    await togglePassword.click();

    await expect(passwordInput).toHaveAttribute('type', 'text');

    await page
        .getByRole('button', {
            name: 'Ocultar senha',
            exact: true,
        })
        .click();

    await expect(passwordInput).toHaveAttribute('type', 'password');
}

test('usuário consegue criar uma conta', async ({ page }) => {
    const uniqueEmail = `e2e-${Date.now()}@clockfile.test`;

    await page.goto('/cadastro');

    await waitForSignUpFormHydration(page);

    await page.locator('input[name="name"]').fill('Usuário Teste');

    await page.locator('input[name="email"]').fill(uniqueEmail);

    await page.locator('input[name="phone"]').fill('11999999999');

    await page.locator('input[name="password"]').fill('Teste123');

    await page.locator('input[name="passwordConfirmation"]').fill('Teste123');

    await expect(
        page.getByText('As senhas coincidem', {
            exact: true,
        })
    ).toBeVisible();

    const submitButton = page.getByRole('button', {
        name: 'Criar conta',
        exact: true,
    });

    await expect(submitButton).toBeEnabled();

    await submitButton.click();

    await expect(page).toHaveURL(/\/dashboard$/, {
        timeout: 15_000,
    });

    await expect(page.getByText(/Olá,\s*Usuário/i)).toBeVisible();
});

test('não permite cadastro com senha fraca', async ({ page }) => {
    await page.goto('/cadastro');

    await waitForSignUpFormHydration(page);

    await page.locator('input[name="name"]').fill('Usuário Teste');

    await page.locator('input[name="email"]').fill(`e2e-fraca-${Date.now()}@clockfile.test`);

    await page.locator('input[name="phone"]').fill('11999999999');

    await page.locator('input[name="password"]').fill('12345678');

    await page.locator('input[name="passwordConfirmation"]').fill('12345678');

    await expect(
        page.getByText('Pelo menos uma letra maiúscula', {
            exact: true,
        })
    ).toBeVisible();

    await expect(
        page.getByRole('button', {
            name: 'Criar conta',
            exact: true,
        })
    ).toBeDisabled();
});

test('não permite cadastro com senhas diferentes', async ({ page }) => {
    await page.goto('/cadastro');

    await waitForSignUpFormHydration(page);

    await page.locator('input[name="password"]').fill('Teste123');

    await page.locator('input[name="passwordConfirmation"]').fill('Teste456');

    await expect(
        page.getByText('As senhas não coincidem', {
            exact: true,
        })
    ).toBeVisible();

    await expect(
        page.getByRole('button', {
            name: 'Criar conta',
            exact: true,
        })
    ).toBeDisabled();
});
