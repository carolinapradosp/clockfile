# Clockfile

Clockfile é uma aplicação web para gerenciamento de projetos, registro de horas trabalhadas, acompanhamento de valores e geração de faturas.

O sistema foi desenvolvido para facilitar o controle do trabalho por projeto, permitindo registrar atividades, acompanhar horas e valores gerados e transformar esses dados em faturas de forma simples e organizada.

## Funcionalidades

- Autenticação e gerenciamento de conta
- Cadastro e gerenciamento de projetos
- Arquivamento e reativação de projetos
- Definição de valor por hora e moeda por projeto
- Definição manual do valor por hora em lançamentos quando o projeto não possui um valor padrão
- Registro e edição de atividades e horas trabalhadas
- Cálculo automático do valor de cada lançamento com base na duração e no valor por hora
- Relatórios mensais com filtros por projeto
- Impressão e exportação de relatórios em PDF
- Criação, edição e gerenciamento de faturas
- Importação de horas registradas para faturas
- Controle dos lançamentos já vinculados a faturas
- Gerenciamento dos status das faturas
- Controle de faturas em aberto, vencidas e pagas
- Impressão e exportação de faturas em PDF
- Suporte a múltiplas moedas, incluindo BRL, USD e EUR
- Dashboard com resumo e atividades recentes
- Gerenciamento de sessões e segurança da conta
- Sistema integrado para reporte de problemas e bugs
- Interface responsiva para desktop e dispositivos móveis

## Tecnologias

O projeto utiliza principalmente:

- Next.js
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Node.js
- Playwright
- ESLint
- Prettier

## Estrutura

O Clockfile utiliza a arquitetura App Router do Next.js, separando as principais responsabilidades entre:

- `app/` — páginas, layouts, Server Actions e grupos de rotas
- `components/` — componentes reutilizáveis da interface
- `database/` — estrutura e schema do banco de dados
- `e2e/` — testes end-to-end da aplicação
- `interfaces/` — tipos e interfaces TypeScript
- `lib/` — autenticação, acesso ao banco de dados, validações e utilitários
- `public/` — arquivos estáticos

A suíte de testes E2E está organizada por domínio, incluindo autenticação, dashboard, projetos, relatórios, faturas, configurações e suporte.

## Desenvolvimento

### Pré-requisitos

Antes de iniciar, tenha instalado:

- Node.js
- npm
- PostgreSQL

### Instalação

Clone o repositório e instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente necessárias para a aplicação e para a conexão com o banco de dados.

Em seguida, execute o ambiente de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível, por padrão, em:

```text
http://localhost:3000
```

## Testes E2E

O projeto utiliza Playwright para os testes end-to-end.

Os testes cobrem os principais fluxos da aplicação, incluindo:

- autenticação e cadastro;
- proteção de rotas;
- gerenciamento de sessão;
- dashboard;
- criação e gerenciamento de projetos;
- registro e gerenciamento de horas;
- relatórios;
- criação e gerenciamento de faturas;
- configurações da conta;
- reporte de problemas.

Para executar toda a suíte:

```bash
npx playwright test --workers=1
```

Para executar os testes com o navegador visível:

```bash
npx playwright test --headed --workers=1
```

Para executar apenas uma área específica:

```bash
npx playwright test e2e/projects --headed --workers=1
```

Após a execução, o relatório HTML do Playwright pode ser aberto com:

```bash
npx playwright show-report
```

## Banco de dados

O Clockfile utiliza PostgreSQL para persistência dos dados.

Entre as principais entidades armazenadas estão:

- usuários;
- sessões;
- projetos;
- lançamentos de horas;
- faturas;
- relacionamentos entre faturas e lançamentos;
- relatos de problemas.

## Segurança

A aplicação implementa mecanismos como:

- autenticação baseada em sessão;
- armazenamento seguro de senhas por hash;
- proteção de rotas autenticadas;
- validação de propriedade dos recursos;
- gerenciamento e revogação de sessões;
- validação de dados nas Server Actions;
- mensagens de autenticação que evitam revelar a existência de contas.
