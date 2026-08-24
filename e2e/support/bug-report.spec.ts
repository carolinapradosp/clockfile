import { expect, test } from '@playwright/test';

test.describe('Reporte de problemas', () => {
    test('usuário autenticado consegue enviar um relato de problema', async ({ page }) => {
        const timestamp = Date.now();

        const subject = `Problema E2E ${timestamp}`;

        const message =
            'Relato criado automaticamente pelo Playwright para validar o fluxo de suporte.';

        /*
         * =====================================================
         * 1. ACESSA O DASHBOARD
         * =====================================================
         */

        await page.goto('/dashboard');

        await expect(page).toHaveURL(/\/dashboard$/, {
            timeout: 15_000,
        });

        /*
         * =====================================================
         * 2. ABRE O MODAL DE REPORTE
         * =====================================================
         */

        const reportBugButton = page.getByRole('button', {
            name: 'Reportar problema',
            exact: true,
        });

        await expect(reportBugButton).toBeVisible();

        await reportBugButton.click();

        const dialog = page.getByRole('dialog');

        await expect(dialog).toBeVisible();

        await expect(
            dialog.getByRole('heading', {
                name: 'Reportar um problema',
                exact: true,
            })
        ).toBeVisible();

        /*
         * =====================================================
         * 3. PREENCHE O RELATO
         * =====================================================
         */

        const subjectInput = dialog.locator('#bug-subject');

        const messageInput = dialog.locator('#bug-message');

        await expect(subjectInput).toBeVisible();

        await expect(messageInput).toBeVisible();

        await subjectInput.fill(subject);

        await messageInput.fill(message);

        /*
         * As informações técnicas vêm habilitadas por padrão.
         *
         * Isso faz com que a action receba também a URL atual
         * (/dashboard) e o navegador envie o user-agent.
         */
        const technicalInfoCheckbox = dialog.getByRole('checkbox');

        await expect(technicalInfoCheckbox).toBeChecked();

        /*
         * =====================================================
         * 4. ENVIA
         * =====================================================
         */

        const submitButton = dialog.getByRole('button', {
            name: 'Enviar relato',
            exact: true,
        });

        await expect(submitButton).toBeEnabled();

        await submitButton.click();

        /*
         * =====================================================
         * 5. CONFIRMA O SUCESSO
         * =====================================================
         */

        await expect(
            dialog.getByRole('heading', {
                name: 'Relato enviado!',
                exact: true,
            })
        ).toBeVisible({
            timeout: 15_000,
        });

        await expect(
            dialog.getByText(
                'Relato enviado com sucesso. Obrigado por ajudar a melhorar o Clockfile!',
                {
                    exact: true,
                }
            )
        ).toBeVisible();

        /*
         * O formulário deve ter sido substituído
         * pelo estado de sucesso.
         */
        await expect(subjectInput).toHaveCount(0);

        await expect(messageInput).toHaveCount(0);
        /*
         * =====================================================
         * 6. FECHA O ESTADO DE SUCESSO
         * =====================================================
         */

        const closeSuccessButton = dialog
            .getByRole('button', {
                name: 'Fechar',
                exact: true,
            })
            .filter({
                hasText: 'Fechar',
            });

        await expect(closeSuccessButton).toBeVisible();

        await closeSuccessButton.click();

        await expect(dialog).toHaveCount(0);

        /*
         * O usuário deve continuar exatamente na página
         * onde estava antes de enviar o relato.
         */
        await expect(page).toHaveURL(/\/dashboard$/);
    });
});
