# Clockfile

Clockfile é uma aplicação web para gerenciamento de projetos, registro de horas trabalhadas e geração de faturas.

O sistema foi desenvolvido para facilitar o controle de trabalho por projeto, permitindo registrar atividades, acompanhar horas e valores gerados e transformar esses dados em faturas de forma simples.

## Funcionalidades

- Autenticação e gerenciamento de conta
- Cadastro e gerenciamento de projetos
- Definição de valor por hora e moeda por projeto
- Registro de atividades e horas trabalhadas
- Relatórios mensais por projeto
- Cálculo automático dos valores gerados
- Impressão e exportação de relatórios em PDF
- Criação e gerenciamento de faturas
- Importação de horas dos relatórios para faturas
- Gerenciamento de status das faturas
- Impressão e exportação de faturas em PDF
- Suporte a múltiplas moedas, incluindo BRL, USD e EUR
- Gerenciamento de sessões e segurança da conta
- Sistema para reporte de problemas e bugs
- Interface responsiva para desktop e dispositivos móveis

## Tecnologias

O projeto utiliza principalmente:

- Next.js
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Node.js
- ESLint
- Prettier

## Estrutura

O Clockfile utiliza a arquitetura do App Router do Next.js, separando as principais responsabilidades entre:

- `app/` — páginas, layouts, Server Actions e rotas
- `components/` — componentes reutilizáveis da interface
- `interfaces/` — tipos e interfaces TypeScript
- `lib/` — autenticação, banco de dados, validações e utilitários
- `public/` — arquivos estáticos

## Desenvolvimento

Instale as dependências:

```bash
npm install
```
