#!/bin/bash
set -euo pipefail

APP_DIR=/var/www/app

cd "$APP_DIR"

if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "Instalando dependências do backend..."
  npm install
fi

DATABASE_HOST=${DATABASE_HOST:-db-server}
DATABASE_PORT=${DATABASE_PORT:-5432}

echo "Aguardando banco de dados em ${DATABASE_HOST}:${DATABASE_PORT}..."
until nc -z "$DATABASE_HOST" "$DATABASE_PORT"; do
  sleep 2
done

echo "Executando migrations..."
npm run migration:run || echo "  Falha ao rodar migrations (prosseguindo)..."

echo "Executando seeds..."
npm run db:seed || echo " Falha ao rodar seeds (prosseguindo)..."

echo "Iniciando NestJS (modo desenvolvimento)..."
exec npm run start:dev -- --host 0.0.0.0

