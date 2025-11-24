FROM node:20-alpine

RUN apk add --no-cache bash

WORKDIR /var/www/app

COPY ./docker/web/entrypoint.sh /usr/local/bin/entrypoint-web.sh
RUN chmod +x /usr/local/bin/entrypoint-web.sh

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint-web.sh"]


