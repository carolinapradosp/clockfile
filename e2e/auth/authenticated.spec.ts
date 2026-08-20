import { expect, test } from '@playwright/test';

test('sessão autenticada permite acessar o dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/dashboard$/);

    await expect(page.getByText(/Olá,/i)).toBeVisible();
});
