#!/bin/sh

# change env file with DOCKER VARIABLE URL_API value
sed -i "s;^[# ]*\(window.__env.apiUrl * = *\)\(.*\);\1'${URL_API}'\;;" "/usr/share/nginx/html/env.js"

#Substituir as variáveis de ambiente para apontar para o backend
if [ -z "$API_URL" ]; then
  echo "env API_URL is empty, http://localhost will be used"
  export API_URL="http://localhost"
fi
envsubst '${API_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Starting nginx..."
exec nginx -g "daemon off;" ${EXTRA_ARGS}
