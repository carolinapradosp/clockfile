import { expect, test } from '@playwright/test';

test.describe('Dashboard', () => {
    test('exibe corretamente as principais informações do dashboard', async ({ page }) => {
        await page.goto('/dashboard');

        await expect(page).toHaveURL(/\/dashboard$/, {
            timeout: 15_000,
        });

        await expect(
            page.getByRole('heading', {
                name: /Olá,/i,
                level: 1,
            })
        ).toBeVisible();

        const summary = page.getByRole('region', {
            name: 'Resumo',
        });

        await expect(summary).toBeVisible();

        for (const label of [
            'Projetos ativos',
            'Horas no mês',
            'Faturas em aberto',
            'Valor a receber',
        ]) {
            await expect(
                summary.getByText(label, {
                    exact: true,
                })
            ).toBeVisible();
        }

        await expect(
            page.getByRole('heading', {
                name: 'Ações rápidas',
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('heading', {
                name: 'Atividade recente',
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('link', {
                name: 'Novo projeto',
                exact: true,
            })
        ).toHaveAttribute('href', '/projetos/novo');
    });

    test('ações rápidas direcionam para as páginas corretas', async ({ page }) => {
        const actions = [
            {
                href: '/projetos/novo',
                label: 'Criar projeto',
            },
            {
                href: '/relatorios/novo',
                label: 'Registrar horas',
            },
            {
                href: '/faturas/novo',
                label: 'Criar fatura',
            },
        ];

        for (const action of actions) {
            await page.goto('/dashboard');

            await page
                .locator(`a[href="${action.href}"]`)
                .filter({
                    hasText: action.label,
                })
                .click();

            await expect(page).toHaveURL(new RegExp(`${action.href.replaceAll('/', '\\/')}$`), {
                timeout: 15_000,
            });
        }
    });
});
