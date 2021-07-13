#!/bin/bash

echo "Creating default NGINX config template"

ENV_HTTP_ONLY=${ENV_HTTP_ONLY:="no"}

if [ "${ENV_HTTP_ONLY}" = "yes" ] ; then
  echo "Installing default_http_only.conf as default template"
  cp /etc/nginx/templates/default_http_only.conf /etc/nginx/templates/default.conf.template
else
  echo "Installing default_http_and_https.conf as default template"
  cp /etc/nginx/templates/default_http_and_https.conf /etc/nginx/templates/default.conf.template
fi
