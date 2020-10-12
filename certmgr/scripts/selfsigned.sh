#! /bin/bash

create_selfsigned_cert() {
  DEST_DIR="${CERT_PATH}/live/${CERT_NAME}"
  mkdir -p ${DEST_DIR}

  cd ${DEST_DIR}
  openssl req -x509 -nodes -newkey rsa:4096 -days ${CERT_SELF_SIGNED_EXPIRE} -keyout privkey.pem -out fullchain.pem -subj '/CN=localhost'
  if [ "$CERT_VERBOSE" = "1" ] ; then
    echo "Created certificate in ${CERT_PATH} for ${cert_domains}"
    echo "Expires: "`openssl x509 -in fullchain.pem -noout -enddate`
  fi
}


renew_selfsigned_cert()
{
  if [ "$CERT_VERBOSE" = "1" ] ; then
    echo "Checking for renewal of ${CERT_PATH}/live/${CERT_NAME}/fullchain.pem"
  fi

  CERT_MIN_SEC_TO_EXPIRE=$(( ${CERT_MIN_DAYS_TO_EXPIRE} * 3600 * 24 ))
  openssl x509 -noout -in "${CERT_PATH}/live/${CERT_NAME}/fullchain.pem" -checkend ${CERT_MIN_SEC_TO_EXPIRE} > /dev/null
  if [ "$?" = "1" ] ; then
    echo "Renewing the certificate for ${cert_domains}"
    create_selfsigned_cert
  fi
}

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
    renew_selfsigned_cert
    sleep 60 &
    wait $!

  done
else
  exit 0
fi
