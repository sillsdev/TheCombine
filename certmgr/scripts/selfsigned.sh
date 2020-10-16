#! /bin/bash

# Source in func.sh so we can have our nice tools
. $(cd $(dirname $0); pwd)/func.sh

# Initialize the container
init_vars
init_cert_store

# Check to see if the certificate already exists
if [ ! -f "${SELF_SIGNED_PATH}/fullchain.pem" ] ; then
  echo "Creating self-signed certificate"
  create_selfsigned_cert
fi

while true; do
  renew_selfsigned_cert
  sleep 24h &
  wait $!
done
