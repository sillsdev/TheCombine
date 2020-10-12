#! /bin/bash

# Source in util.sh so we can have our nice tools
. $(cd $(dirname $0); pwd)/func.sh

# Container initialization
init_vars

if [ ${CERT_CLEAN} = "1" ] ; then
  if [ -d "${CERT_PATH}/live/${cert_domains}" ]; then
    clean_certs
  fi
fi

# Create the initial certificate if the certs have not already
# been created
if [ ! -d "${CERT_PATH}/live/${cert_domains}" ]; then
  echo "Creating initial self-signed certificate"
  create_selfsigned_cert
  echo "Waiting for webserver to come up"
  if ! wait_for_webserver ; then
    exit 1
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
