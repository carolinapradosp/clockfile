import { expect, test } from '@playwright/test';

import { createProject, createReportEntry, selectOptionByLabel } from '../helpers/e2e-helpers';

test.describe('Filtros e impressão de relatórios', () => {
    test('filtra lançamentos por projeto e mês', async ({ page }) => {
        const timestamp = Date.now();

        const projectA = `Projeto Filtro A E2E ${timestamp}`;
        const projectB = `Projeto Filtro B E2E ${timestamp}`;

        const taskA = `Atividade Filtro A ${timestamp}`;
        const taskB = `Atividade Filtro B ${timestamp}`;
        const taskOtherMonth = `Atividade Outro Mês ${timestamp}`;

        const month = '2026-12';

        const projectAId = await createProject({
            page,
            projectName: projectA,
            recipientEmail: `filtro-a-${timestamp}@clockfile.test`,
        });

        await createReportEntry({
            page,
            projectName: projectA,
            taskName: taskA,
            date: '2026-12-10',
        });

        await createReportEntry({
            page,
            projectName: projectA,
            taskName: taskOtherMonth,
            date: '2027-01-10',
        });

        await createProject({
            page,
            projectName: projectB,
            recipientEmail: `filtro-b-${timestamp}@clockfile.test`,
        });

        await createReportEntry({
            page,
            projectName: projectB,
            taskName: taskB,
            date: '2026-12-15',
        });

        await page.goto(`/relatorios?month=${month}`);

        await expect(page.locator('#report-month')).toHaveValue(month);

        await expect(
            page.getByRole('link', {
                name: taskA,
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('link', {
                name: taskB,
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('link', {
                name: taskOtherMonth,
                exact: true,
            })
        ).not.toBeVisible();

        const projectFilter = page.locator('#report-project');

        await selectOptionByLabel({
            page,
            select: projectFilter,
            label: projectA,
        });

        await expect
            .poll(() => new URL(page.url()).searchParams.get('projectId'), {
                timeout: 15_000,
            })
            .toBe(projectAId);

        await expect(projectFilter).toHaveValue(projectAId);

        await expect(
            page.getByRole('link', {
                name: taskA,
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('link', {
                name: taskB,
                exact: true,
            })
        ).not.toBeVisible();

        await expect(
            page.getByRole('link', {
                name: taskOtherMonth,
                exact: true,
            })
        ).not.toBeVisible();

        await expect(page.locator('#report-month')).toHaveValue(month);
    });

    test('limpar remove os filtros selecionados', async ({ page }) => {
        const timestamp = Date.now();

        const projectName = `Projeto Limpar Filtro E2E ${timestamp}`;
        const month = '2026-12';

        const projectId = await createProject({
            page,
            projectName,
            recipientEmail: `limpar-${timestamp}@clockfile.test`,
        });

        await page.goto(`/relatorios?month=${month}&projectId=${projectId}`);

        await expect(page.locator('#report-month')).toHaveValue(month);

        await expect(page.locator('#report-project')).toHaveValue(projectId);

        await page
            .getByRole('button', {
                name: 'Limpar',
                exact: true,
            })
            .click();

        await expect
            .poll(() => new URL(page.url()).search, {
                timeout: 15_000,
            })
            .toBe('');

        await expect(page.locator('#report-project')).toHaveValue('');

        const currentMonth = new Date().toISOString().slice(0, 7);

        await expect(page.locator('#report-month')).toHaveValue(currentMonth);
    });

    test('página de impressão respeita mês e projeto selecionados', async ({ page }) => {
        const timestamp = Date.now();

        const projectA = `Projeto Impressão A E2E ${timestamp}`;
        const projectB = `Projeto Impressão B E2E ${timestamp}`;

        const taskA = `Atividade Impressão A ${timestamp}`;
        const taskB = `Atividade Impressão B ${timestamp}`;

        const month = '2026-12';

        const projectAId = await createProject({
            page,
            projectName: projectA,
            recipientEmail: `impressao-a-${timestamp}@clockfile.test`,
        });

        await createReportEntry({
            page,
            projectName: projectA,
            taskName: taskA,
            date: '2026-12-05',
            duration: '02:00',
        });

        await createProject({
            page,
            projectName: projectB,
            recipientEmail: `impressao-b-${timestamp}@clockfile.test`,
        });

        await createReportEntry({
            page,
            projectName: projectB,
            taskName: taskB,
            date: '2026-12-06',
            duration: '03:00',
        });

        await page.goto(`/relatorios/imprimir?month=${month}&projectId=${projectAId}`);

        await expect(
            page.getByRole('heading', {
                name: 'Relatório de horas',
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText(`Projeto: ${projectA}`, {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText(taskA, {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText(taskB, {
                exact: true,
            })
        ).not.toBeVisible();

        await expect(
            page.getByText(projectB, {
                exact: true,
            })
        ).not.toBeVisible();

        await expect(
            page.getByRole('cell', {
                name: '02:00',
                exact: true,
            })
        ).toBeVisible();

        const backLink = page.getByRole('link', {
            name: 'Voltar para relatórios',
            exact: true,
        });

        await expect(backLink).toHaveAttribute(
            'href',
            `/relatorios?month=${month}&projectId=${projectAId}`
        );

        await expect(
            page.getByRole('button', {
                name: 'Imprimir ou salvar PDF',
                exact: true,
            })
        ).toBeVisible();
    });

    test('botão de impressão aciona a impressão do navegador', async ({ page }) => {
        await page.goto('/relatorios/imprimir?month=2026-12');

        await page.evaluate(() => {
            window.print = () => {
                document.body.dataset.printCalled = 'true';
            };
        });

        await page
            .getByRole('button', {
                name: 'Imprimir ou salvar PDF',
                exact: true,
            })
            .click();

        await expect(page.locator('body')).toHaveAttribute('data-print-called', 'true');
    });
});
