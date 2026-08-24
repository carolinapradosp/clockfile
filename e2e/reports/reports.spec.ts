import { expect, test } from '@playwright/test';

import { selectOptionByLabel } from '../helpers/e2e-helpers';

test.describe('Relatórios', () => {
    test('usuário consegue criar um lançamento de horas', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Relatório E2E ${timestamp}`;
        const taskName = `Tarefa E2E ${timestamp}`;

        await page.goto('/projetos/novo');

        await page.locator('input[name="name"]').fill(projectName);

        await page
            .locator('textarea[name="description"]')
            .fill('Projeto criado para testes E2E de lançamentos.');

        await page.locator('select[name="status"]').selectOption('active');
        await page.locator('select[name="currency"]').selectOption('BRL');
        await page.locator('input[name="defaultHourlyRate"]').fill('200');

        await page
            .getByRole('button', {
                name: 'Cadastrar projeto',
                exact: true,
            })
            .click();

        await expect(page).toHaveURL(/\/projetos\/[^/]+$/, {
            timeout: 15_000,
        });

        await page.goto('/relatorios/novo');

        await expect(page).toHaveURL(/\/relatorios\/novo$/);

        const projectSelect = page.locator('select[name="projectId"]');

        await selectOptionByLabel({
            page,
            select: projectSelect,
            label: projectName,
        });

        const rateInput = page.locator('input[name="rate"]');

        await expect(rateInput).toHaveValue('200');
        await expect(rateInput).toHaveAttribute('readonly', '');

        await page.locator('input[name="task"]').fill(taskName);

        await page
            .locator('textarea[name="description"]')
            .fill('Implementação automatizada para teste E2E.');

        await page.locator('input[name="duration"]').fill('01:30');

        await expect(page.getByText(/90 minutos/i)).toBeVisible();
        await expect(page.getByText(/300,00/)).toBeVisible();

        const saveButton = page.getByRole('button', {
            name: 'Salvar lançamento',
            exact: true,
        });

        await expect(saveButton).toBeEnabled();

        await saveButton.click();

        await expect(page).toHaveURL(/\/relatorios(?:\?.*)?$/, {
            timeout: 15_000,
        });

        const taskLink = page.getByRole('link', {
            name: taskName,
            exact: true,
        });

        await expect(taskLink).toBeVisible();

        const createdRow = page.getByRole('row').filter({
            has: taskLink,
        });

        await expect(createdRow).toBeVisible();

        await expect(
            createdRow.getByText('01:30', {
                exact: true,
            })
        ).toBeVisible();

        await expect(createdRow.getByText(/200,00/)).toBeVisible();
        await expect(createdRow.getByText(/300,00/)).toBeVisible();

        await expect(
            page.getByRole('link', {
                name: `Editar ${taskName}`,
                exact: true,
            })
        ).toBeVisible();
    });
});
