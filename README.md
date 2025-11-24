# Sistema de Gestão de Estoque

Sistema completo para gestão de estoque com API REST (NestJS) e interface web (Vue.js + Vuetify).

## Estrutura do Projeto

- `Estoque-api/` - API backend desenvolvida em NestJS
- `estoque-client/` - Frontend desenvolvido em Vue.js 3 + Vuetify
- `docker/` - Configurações Docker e Docker Compose

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Docker e Docker Compose (opcional, para execução via containers)
- PostgreSQL (se executar localmente sem Docker)

## Executando com Docker

A forma mais simples de executar o projeto é usando Docker Compose:

```bash
cd docker
docker-compose up -d
```

Os serviços estarão disponíveis em:
- API: http://localhost:3005
- Frontend: http://localhost:8080
- Banco de Dados: localhost:5432

Para parar os serviços:

```bash
cd docker
docker-compose down
```

## Executando Localmente

### 1. Configurar Banco de Dados

Certifique-se de ter o PostgreSQL instalado e rodando, ou use Docker para apenas o banco:

```bash
docker run --name postgres-estoque -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=produto -p 5432:5432 -d postgres
```

### 2. Configurar e Executar a API

```bash
cd Estoque-api
npm install
cp api.env .env
npm run start:dev
```

A API estará disponível em http://localhost:3005

### 3. Configurar e Executar o Frontend

```bash
cd estoque-client
npm install
npm run dev
```

O frontend estará disponível em http://localhost:5173

## Configuração de Variáveis de Ambiente

### API (Estoque-api/.env)

Copie o arquivo `api.env` para `.env` e ajuste conforme necessário:

```
PORT=3005
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=admin
DATABASE_NAME=produto
JWT_SECRET=seu-jwt-secret-aqui
JWT_EXPIRES_IN=3600
CORS_ORIGIN=http://localhost:5173
```

### Frontend (estoque-client/.env)

Crie um arquivo `.env` se necessário:

```
VITE_API_BASE_URL=http://localhost:3005
```

## Migrações do Banco de Dados

Para executar as migrações na API:

```bash
cd Estoque-api
npm run migration:run
```

## Scripts Disponíveis

### API
- `npm run start:dev` - Inicia em modo desenvolvimento
- `npm run start:prod` - Inicia em modo produção
- `npm run migration:run` - Executa migrações
- `npm run db:seed` - Popula o banco com dados iniciais

### Frontend
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza build de produção

