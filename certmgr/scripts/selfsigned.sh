#! /bin/bash

# Source in util.sh so we can have our nice tools
. $(cd $(dirname $0); pwd)/func.sh

CERT_MODE="self-signed"

# Container initialization
init_vars
init_cert_store

if [ ! -f "${SELF_SIGNED_PATH}/fullchain.pem" ] ; then
  echo "Creating self-signed certificate"
  create_selfsigned_cert
fi

if [ "$CERT_CREATE_ONLY" = "0" ] ; then
  while true; do
    renew_selfsigned_cert
    sleep 60 &
    wait $!

  done
else
  exit 0
fi
