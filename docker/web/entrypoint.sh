#!/bin/bash
set -euo pipefail

APP_DIR=/var/www/app
# Navega até o diretório da aplicação
cd "$APP_DIR"

# Verifica se o diretório node_modules está vazio ou não existe
# Ou se o pacote vite-plugin-vue-layouts-next não está instalado
if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ] || [ ! -d "node_modules/vite-plugin-vue-layouts-next" ]; then
  echo "Instalando dependências do frontend..."
  npm install --no-audit --no-fund
  echo "Dependências instaladas com sucesso!"
fi
# Define a variável de ambiente para a URL base da API
API_URL=${VITE_API_BASE_URL:-http://localhost:3005}
echo "Usando API base URL: ${API_URL}"

echo "Iniciando Vite no modo desenvolvimento..."
exec npm run dev -- --host 0.0.0.0 --port "${VITE_PORT:-8080}"