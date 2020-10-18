#! /bin/bash

# Source in func.sh so we can have our nice tools
. $(cd $(dirname $0); pwd)/func.sh

# Initialize the container
init_vars
init_cert_store

# Create the initial certificate if the certs have not already
# been created
if [ ! -L "${NGINX_CERT_PATH}" ] ; then
  echo "Creating initial self-signed certificate"
  create_selfsigned_cert
fi

# Lookup the issuer of the certificate (either pre-existing or just created)
CERT_ISSUER=""
if [ -f "${NGINX_CERT_PATH}/fullchain.pem" ] ; then
  CERT_ISSUER=`openssl x509 -in "${NGINX_CERT_PATH}/fullchain.pem" -noout -issuer | sed 's/issuer=CN *= *//'`
  debug_log "Issuer for existing certificate is: ${CERT_ISSUER}"
fi

# If it is a self-signed cert, wait for the webserver to come up
# and replace it with a cert from letsencrypt
if [ -z "${CERT_ISSUER}" ] || [ "${CERT_ISSUER}" = "localhost" ] ; then
  echo "Waiting for webserver to come up"
  if ! wait_for_webserver ; then
    debug_log "Could not connect to webserver"
    #exit 1
  fi

  echo "Request certificate from Let's Encrypt"
  create_certbot_cert
fi

# Check for certificate renewal every 12 hours
while :; do
  certbot renew
  sleep 12h &
  wait $!
done
