import { expect, test } from '@playwright/test';

test.describe('Configurações', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/configuracoes');

        await expect(page).toHaveURL(/\/configuracoes$/, {
            timeout: 15_000,
        });

        await expect(
            page.getByRole('heading', {
                name: 'Configurações',
                exact: true,
                level: 1,
            })
        ).toBeVisible();
    });

    test('exibe os dados pessoais do usuário autenticado', async ({ page }) => {
        /*
         * =====================================================
         * DADOS PESSOAIS
         * =====================================================
         */

        await expect(
            page.getByRole('heading', {
                name: 'Dados pessoais',
                exact: true,
            })
        ).toBeVisible();

        const nameInput = page.locator('#account-name');

        const emailInput = page.locator('#account-email');

        const phoneInput = page.locator('#account-phone');

        await expect(nameInput).toBeVisible();

        await expect(emailInput).toBeVisible();

        await expect(phoneInput).toBeVisible();

        /*
         * O usuário E2E deve continuar
         * usando o e-mail configurado.
         */

        await expect(emailInput).toHaveValue('e2e@clockfile.test');

        /*
         * Não modificamos nem salvamos os
         * dados aqui para não alterar o
         * usuário compartilhado pelos testes.
         */

        await expect(
            page.getByRole('button', {
                name: 'Salvar alterações',
                exact: true,
            })
        ).toBeVisible();
    });

    test('não permite utilizar a senha atual como nova senha', async ({ page }) => {
        /*
         * =====================================================
         * ALTERAÇÃO DE SENHA
         * =====================================================
         */

        await expect(
            page.getByRole('heading', {
                name: 'Alterar senha',
                exact: true,
            })
        ).toBeVisible();

        const currentPassword = page.locator('input[name="currentPassword"]');

        const newPassword = page.locator('input[name="newPassword"]');

        const confirmation = page.locator('input[name="passwordConfirmation"]');

        /*
         * Usa a mesma senha nos três campos.
         *
         * Ela é forte e as confirmações coincidem,
         * mas deve falhar na regra:
         *
         * "Ser diferente da senha atual".
         */

        await currentPassword.fill('Teste123');

        await newPassword.fill('Teste123');

        await confirmation.fill('Teste123');

        await expect(
            page.getByText('Entre 8 e 12 caracteres', {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText('Pelo menos uma letra maiúscula', {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText('Pelo menos um número', {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText('Ser diferente da senha atual', {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText('As senhas coincidem', {
                exact: true,
            })
        ).toBeVisible();

        /*
         * Apesar das senhas coincidirem,
         * o botão precisa continuar desabilitado.
         */

        await expect(
            page.getByRole('button', {
                name: 'Alterar senha',
                exact: true,
            })
        ).toBeDisabled();
    });

    test('não permite nova senha fraca', async ({ page }) => {
        const currentPassword = page.locator('input[name="currentPassword"]');

        const newPassword = page.locator('input[name="newPassword"]');

        const confirmation = page.locator('input[name="passwordConfirmation"]');

        await currentPassword.fill('Teste123');

        /*
         * Possui 8 caracteres, mas não possui
         * letra maiúscula.
         */

        await newPassword.fill('teste123');

        await confirmation.fill('teste123');

        await expect(
            page.getByRole('button', {
                name: 'Alterar senha',
                exact: true,
            })
        ).toBeDisabled();

        /*
         * A confirmação pode coincidir,
         * mas a senha continua fraca.
         */

        await expect(
            page.getByText('As senhas coincidem', {
                exact: true,
            })
        ).toBeVisible();
    });

    test('não permite senhas de confirmação diferentes', async ({ page }) => {
        await page.locator('input[name="currentPassword"]').fill('Teste123');

        await page.locator('input[name="newPassword"]').fill('NovaSenha123');

        await page.locator('input[name="passwordConfirmation"]').fill('OutraSenha123');

        await expect(
            page.getByText('As senhas não coincidem', {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'Alterar senha',
                exact: true,
            })
        ).toBeDisabled();
    });

    test('habilita alteração quando a nova senha atende todos os requisitos', async ({ page }) => {
        await page.locator('input[name="currentPassword"]').fill('Teste123');

        await page.locator('input[name="newPassword"]').fill('NovaSenha12');

        await page.locator('input[name="passwordConfirmation"]').fill('NovaSenha12');

        await expect(
            page.getByText('As senhas coincidem', {
                exact: true,
            })
        ).toBeVisible();

        /*
         * Não clicamos.
         *
         * Só verificamos que o formulário
         * permitiria a submissão.
         *
         * Assim não modificamos a senha do
         * usuário E2E compartilhado.
         */

        await expect(
            page.getByRole('button', {
                name: 'Alterar senha',
                exact: true,
            })
        ).toBeEnabled();
    });

    test('abre e cancela o modal para encerrar outras sessões', async ({ page }) => {
        /*
         * =====================================================
         * SESSÕES E SEGURANÇA
         * =====================================================
         */

        await expect(
            page.getByRole('heading', {
                name: 'Sessões e segurança',
                exact: true,
            })
        ).toBeVisible();

        const revokeButton = page.getByRole('button', {
            name: 'Encerrar outras sessões',
            exact: true,
        });

        await expect(revokeButton).toBeVisible();

        await revokeButton.click();

        /*
         * Confirma que não estamos mais usando
         * window.confirm e que o modal customizado
         * foi aberto.
         */

        await expect(
            page.getByText('Encerrar outras sessões?', {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText(
                /Todos os acessos realizados em outros navegadores ou dispositivos serão encerrados/i
            )
        ).toBeVisible();

        const cancelButton = page.getByRole('button', {
            name: 'Cancelar',
            exact: true,
        });

        await expect(cancelButton).toBeVisible();

        /*
         * Cancela para não revogar sessões
         * utilizadas pelos outros testes.
         */

        await cancelButton.click();

        await expect(
            page.getByText('Encerrar outras sessões?', {
                exact: true,
            })
        ).not.toBeVisible();

        /*
         * A sessão atual continua válida.
         */

        await expect(page).toHaveURL(/\/configuracoes$/);
    });
});
