#! /bin/bash

CERT_MODE=${CERT_MODE:="self-signed"}

case ${CERT_MODE} in
  self-signed)
    selfsigned.sh
    ;;
  letsencrypt)
    letsencrypt.sh
    ;;
  cert-server | cert-client)
    echo "${CERT_MODE} is not implemented yet"
    ;;
  *)
    echo "${CERT_MODE} is not recognized"
    ;;
esac

exit 99
