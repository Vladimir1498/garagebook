#!/bin/sh

# Replace PORT_PLACEHOLDER with actual PORT or default 8080
PORT=${PORT:-8080}
sed -i "s/PORT_PLACEHOLDER/$PORT/g" /etc/nginx/nginx.conf

# Start nginx
nginx -g 'daemon off;'
