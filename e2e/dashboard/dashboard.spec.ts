//e2e/dashboard/dashboard.spec.ts
import { expect, test } from '@playwright/test';

test.describe('Dashboard', () => {
    test('exibe corretamente as principais informações do dashboard', async ({ page }) => {
        await page.goto('/dashboard');

        await expect(page).toHaveURL(/\/dashboard$/, {
            timeout: 15_000,
        });

        /*
         * =====================================================
         * CABEÇALHO
         * =====================================================
         */

        await expect(
            page.getByRole('heading', {
                name: /Olá,/i,
                level: 1,
            })
        ).toBeVisible();

        await expect(
            page.getByText('Visão geral', {
                exact: true,
            })
        ).toBeVisible();

        /*
         * =====================================================
         * RESUMO
         * =====================================================
         */

        const summary = page.getByRole('region', {
            name: 'Resumo',
        });

        await expect(summary).toBeVisible();

        await expect(
            summary.getByText('Projetos ativos', {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            summary.getByText('Horas no mês', {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            summary.getByText('Faturas em aberto', {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            summary.getByText('Valor a receber', {
                exact: true,
            })
        ).toBeVisible();

        /*
         * =====================================================
         * AÇÕES RÁPIDAS
         * =====================================================
         */

        await expect(
            page.getByRole('heading', {
                name: 'Ações rápidas',
                exact: true,
            })
        ).toBeVisible();

        const createProjectLink = page.locator('a[href="/projetos/novo"]').filter({
            hasText: 'Criar projeto',
        });

        const registerHoursLink = page.locator('a[href="/relatorios/novo"]');

        const createInvoiceLink = page.locator('a[href="/faturas/novo"]');

        await expect(createProjectLink).toBeVisible();

        await expect(registerHoursLink).toBeVisible();

        await expect(createInvoiceLink).toBeVisible();

        await expect(createProjectLink).toContainText('Criar projeto');

        await expect(registerHoursLink).toContainText('Registrar horas');

        await expect(createInvoiceLink).toContainText('Criar fatura');

        /*
         * =====================================================
         * ATIVIDADE RECENTE
         * =====================================================
         */

        await expect(
            page.getByRole('heading', {
                name: 'Atividade recente',
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText('Seus lançamentos e faturas mais recentes.', {
                exact: true,
            })
        ).toBeVisible();

        /*
         * Aqui usamos o nome acessível exato.
         *
         * Isso evita conflito com o card
         * "Criar projeto", cuja descrição
         * também contém "novo projeto".
         */

        const newProjectLink = page.getByRole('link', {
            name: 'Novo projeto',
            exact: true,
        });

        await expect(newProjectLink).toBeVisible();

        await expect(newProjectLink).toHaveAttribute('href', '/projetos/novo');
    });

    test('ações rápidas direcionam para as páginas corretas', async ({ page }) => {
        await page.goto('/dashboard');

        await expect(page).toHaveURL(/\/dashboard$/, {
            timeout: 15_000,
        });

        /*
         * =====================================================
         * CRIAR PROJETO
         * =====================================================
         */

        await page
            .locator('a[href="/projetos/novo"]')
            .filter({
                hasText: 'Criar projeto',
            })
            .click();

        await expect(page).toHaveURL(/\/projetos\/novo$/, {
            timeout: 15_000,
        });

        /*
         * =====================================================
         * REGISTRAR HORAS
         * =====================================================
         */

        await page.goto('/dashboard');

        await page.locator('a[href="/relatorios/novo"]').click();

        await expect(page).toHaveURL(/\/relatorios\/novo$/, {
            timeout: 15_000,
        });

        /*
         * =====================================================
         * CRIAR FATURA
         * =====================================================
         */

        await page.goto('/dashboard');

        await page.locator('a[href="/faturas/novo"]').click();

        await expect(page).toHaveURL(/\/faturas\/novo$/, {
            timeout: 15_000,
        });
    });
});
