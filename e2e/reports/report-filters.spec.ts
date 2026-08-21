import { expect, test, type Locator, type Page } from '@playwright/test';

const PROJECT_DETAILS_URL =
    /\/projetos\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function selectOptionByLabel({
    page,
    select,
    label,
}: {
    page: Page;
    select: Locator;
    label: string;
}) {
    await expect(select).toBeVisible();

    const option = () =>
        select.locator('option').filter({
            hasText: label,
        });

    if (!(await option().count())) {
        await page.reload();

        await expect(option()).toBeAttached({
            timeout: 15_000,
        });
    }

    await select.selectOption({
        label,
    });
}

async function createProject({
    page,
    projectName,
    hourlyRate = '200',
    recipientEmail,
}: {
    page: Page;
    projectName: string;
    hourlyRate?: string;
    recipientEmail: string;
}) {
    await page.goto('/projetos/novo');

    await page.locator('input[name="name"]').fill(projectName);

    await page
        .locator('textarea[name="description"]')
        .fill('Projeto criado pelo teste E2E de filtros.');

    await page.locator('select[name="status"]').selectOption('active');

    await page.locator('select[name="currency"]').selectOption('BRL');

    await page.locator('input[name="defaultHourlyRate"]').fill(hourlyRate);

    await page.locator('input[name="billingName"]').fill('Cliente Filtros Automatizado');

    await page.locator('input[name="billingEmail"]').fill(recipientEmail);

    await page.locator('select[name="billingCountryCode"]').selectOption('BR');

    await page
        .getByRole('button', {
            name: 'Cadastrar projeto',
            exact: true,
        })
        .click();

    await expect(page).toHaveURL(PROJECT_DETAILS_URL, {
        timeout: 15_000,
    });

    const projectId = new URL(page.url()).pathname.split('/').filter(Boolean).at(-1);

    expect(projectId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );

    return projectId!;
}

async function createReportEntry({
    page,
    projectName,
    taskName,
    date,
    duration = '01:00',
}: {
    page: Page;
    projectName: string;
    taskName: string;
    date: string;
    duration?: string;
}) {
    await page.goto('/relatorios/novo');

    const projectSelect = page.locator('select[name="projectId"]');

    await selectOptionByLabel({
        page,
        select: projectSelect,
        label: projectName,
    });

    await page.locator('input[name="task"]').fill(taskName);

    await page
        .locator('textarea[name="description"]')
        .fill('Lançamento criado pelo teste E2E de filtros.');

    await page.locator('input[name="date"]').fill(date);

    await page.locator('input[name="duration"]').fill(duration);

    await page
        .getByRole('button', {
            name: 'Salvar lançamento',
            exact: true,
        })
        .click();

    await expect(page).toHaveURL(/\/relatorios(?:\?.*)?$/, {
        timeout: 15_000,
    });
}

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
