FROM nginx:alpine

COPY nginx/default.conf.template /etc/nginx/conf.d/default.conf.template

RUN rm -f /etc/ssl/localhost.crt
RUN rm -f /etc/ssl/localhost.key

RUN rm -rf /usr/share/nginx/html/*

COPY / /usr/share/nginx/html

ADD entrypoint.sh entrypoint.sh
RUN chmod 755 entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
