import { expect, test } from '@playwright/test';

test.describe('Configurações', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/configuracoes');

        await expect(page).toHaveURL(/\/configuracoes$/, {
            timeout: 15_000,
        });
    });

    test('exibe os dados pessoais do usuário autenticado', async ({ page }) => {
        await expect(page.locator('#account-name')).toBeVisible();
        await expect(page.locator('#account-email')).toHaveValue('e2e@clockfile.test');
        await expect(page.locator('#account-phone')).toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'Salvar alterações',
                exact: true,
            })
        ).toBeVisible();
    });

    test('valida as regras da nova senha antes da alteração', async ({ page }) => {
        const currentPassword = page.locator('input[name="currentPassword"]');
        const newPassword = page.locator('input[name="newPassword"]');
        const confirmation = page.locator('input[name="passwordConfirmation"]');

        const submitButton = page.getByRole('button', {
            name: 'Alterar senha',
            exact: true,
        });

        await currentPassword.fill('Teste123');
        await newPassword.fill('Teste123');
        await confirmation.fill('Teste123');

        await expect(
            page.getByText('Ser diferente da senha atual', {
                exact: true,
            })
        ).toBeVisible();

        await expect(submitButton).toBeDisabled();

        await newPassword.fill('teste123');
        await confirmation.fill('teste123');
        await expect(submitButton).toBeDisabled();

        await newPassword.fill('NovaSenha123');
        await confirmation.fill('OutraSenha123');

        await expect(
            page.getByText('As senhas não coincidem', {
                exact: true,
            })
        ).toBeVisible();

        await expect(submitButton).toBeDisabled();

        await newPassword.fill('NovaSenha12');
        await confirmation.fill('NovaSenha12');

        await expect(
            page.getByText('As senhas coincidem', {
                exact: true,
            })
        ).toBeVisible();

        await expect(submitButton).toBeEnabled();
    });

    test('abre e cancela o modal para encerrar outras sessões', async ({ page }) => {
        const revokeButton = page.getByRole('button', {
            name: 'Encerrar outras sessões',
            exact: true,
        });

        await expect(revokeButton).toBeVisible();
        await revokeButton.click();

        await expect(
            page.getByText('Encerrar outras sessões?', {
                exact: true,
            })
        ).toBeVisible();

        await page.getByRole('button', { name: 'Cancelar', exact: true }).click();

        await expect(
            page.getByText('Encerrar outras sessões?', {
                exact: true,
            })
        ).not.toBeVisible();

        await expect(page).toHaveURL(/\/configuracoes$/);
    });
});
