import { expect, test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

const TEST_USER = {
    email: 'e2e@clockfile.test',
    password: 'Teste123',
};

setup('autenticar usuário E2E', async ({ page }) => {
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

    await page.context().storageState({
        path: authFile,
    });
});
