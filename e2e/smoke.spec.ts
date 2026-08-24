//e2e/smoke.spec.ts
import { expect, test } from '@playwright/test';

test('a aplicação abre', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/localhost|127\.0\.0\.1/);
});
