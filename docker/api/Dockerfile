FROM node:22-alpine

RUN apk add --no-cache bash curl netcat-openbsd
RUN npm install -g @nestjs/cli
## Define o diretório de trabalho dentro do contêiner
WORKDIR /var/www/app
## Copia os arquivos do projeto para o diretório de trabalho
COPY ./docker/api/entrypoint.sh /usr/local/bin/entrypoint-api.sh
## Copia os arquivos do projeto para o diretório de trabalho
RUN chmod +x /usr/local/bin/entrypoint-api.sh

EXPOSE 3005
## Define o ponto de entrada do contêiner
ENTRYPOINT ["/usr/local/bin/entrypoint-api.sh"]
