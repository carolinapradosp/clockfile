import { expect, test } from '@playwright/test';

test.describe('Reporte de problemas', () => {
    test('usuário autenticado consegue enviar um relato de problema', async ({ page }) => {
        const timestamp = Date.now();

        await page.goto('/dashboard');

        const reportBugButton = page.getByRole('button', {
            name: 'Reportar problema',
            exact: true,
        });

        await expect(reportBugButton).toBeVisible();
        await reportBugButton.click();

        const dialog = page.getByRole('dialog');

        await expect(dialog).toBeVisible();

        await dialog.locator('#bug-subject').fill(`Problema E2E ${timestamp}`);
        await dialog
            .locator('#bug-message')
            .fill('Relato criado automaticamente pelo Playwright para validar o fluxo de suporte.');

        await expect(dialog.getByRole('checkbox')).toBeChecked();

        await dialog
            .getByRole('button', {
                name: 'Enviar relato',
                exact: true,
            })
            .click();

        await expect(
            dialog.getByRole('heading', {
                name: 'Relato enviado!',
                exact: true,
            })
        ).toBeVisible({
            timeout: 15_000,
        });

        await dialog
            .getByRole('button', {
                name: 'Fechar',
                exact: true,
            })
            .filter({
                hasText: 'Fechar',
            })
            .click();

        await expect(dialog).toHaveCount(0);
        await expect(page).toHaveURL(/\/dashboard$/);
    });
});
