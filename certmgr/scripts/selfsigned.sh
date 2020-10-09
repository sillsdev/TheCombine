#! /bin/bash

# Source in util.sh so we can have our nice tools
. $(cd $(dirname $0); pwd)/func.sh

CERT_MODE="self-signed"

# Container initialization
init_vars

if [ ${CERT_CLEAN} = "1" ] ; then
  if [ -d "${CERT_PATH}/live/${cert_domains}" ]; then
    clean_certs
  fi
fi

if [ -d "${CERT_PATH}/live/${cert_domains}" ]; then
  create_selfsigned_cert
fi

if [ "$CERT_CREATE_ONLY" = "0" ] ; then
  while true; do
    check_renewal
    sleep 60 &
    wait $!

  done
else
  exit 0
fi
