# API de Gestão de Estoque

API REST desenvolvida com NestJS para gestão de estoque, produtos, fornecedores e movimentações.

## Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL
- npm ou yarn

## Instalação

```bash
npm install
```

## Configuração

Copie o arquivo `api.env` para `.env` e configure as variáveis de ambiente:

```
PORT=3005
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=admin
DATABASE_NAME=produto
DATABASE_SYNCHRONIZE=false
JWT_SECRET=seu-jwt-secret-aqui
JWT_EXPIRES_IN=3600
CORS_ORIGIN=http://localhost:8080
```

## Executando a Aplicação

### Modo Desenvolvimento

```bash
npm run start:dev
```

A API estará disponível em http://localhost:3005

### Modo Produção

```bash
npm run build
npm run start:prod
```

## Migrações do Banco de Dados

Executar migrações:

```bash
npm run migration:run
```

Reverter última migração:

```bash
npm run migration:revert
```

## Seeds (Dados Iniciais)

Popular o banco de dados com dados iniciais:

```bash
npm run db:seed
```

## Notas Importantes

A geração automática dos códigos de produtos (`PROD###`) e lotes (`L###`) é realizada exclusivamente pelo backend. O banco não utiliza triggers para esse fluxo. Ao criar registros via API, envie o campo de código apenas quando desejar sobrescrever manualmente o padrão.

## Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## Scripts Disponíveis

- `npm run start` - Inicia a aplicação
- `npm run start:dev` - Inicia em modo watch (desenvolvimento)
- `npm run start:prod` - Inicia em modo produção
- `npm run build` - Compila o projeto
- `npm run migration:run` - Executa migrações pendentes
- `npm run migration:revert` - Reverte última migração
- `npm run db:seed` - Executa seeds do banco de dados
