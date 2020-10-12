#! /bin/bash

####################################################
# Initialize all the variables used by these scripts
####################################################
init_vars() {
  # set variables to their default values if they are not
  # specified
  CERT_PATH=${CERT_PATH:="/etc/letsencrypt"}
  CERT_CLEAN=${CERT_CLEAN:=0}
  CERT_CREATE_ONLY=${CERT_CREATE_ONLY:=0}
  CERT_EMAIL=${CERT_EMAIL:="jimgrady.jg@gmail.com"}
  CERT_STAGING=${CERT_STAGING:=1}
  MAX_CONNECT_TRIES=${MAX_CONNECT_TRIES:=15}
  if [ "${CERT_MODE}" = "self-signed" ] ; then
    CERT_SELF_SIGNED_EXPIRE=3650
    CERT_MIN_DAYS_TO_EXPIRE=10
  else
    CERT_SELF_SIGNED_EXPIRE=1
    CERT_MIN_DAYS_TO_EXPIRE=1
  fi
  # create $cert_domains as an array of domain names
  IFS=" " read -r -a cert_domains <<< "${CERT_DOMAINS}"
  CERT_NAME=${CERT_NAME:="$cert_domains"}
  if [ "$CERT_VERBOSE" = "1" ] ; then
    echo "Certificates stored in ${CERT_PATH}"
    echo "Certificate name: ${CERT_NAME}"
    echo "Domains: ${cert_domains[*]}"
    echo "Certificates expire in ${CERT_SELF_SIGNED_EXPIRE}"
    echo "Minimum days before renewal: ${CERT_MIN_DAYS_TO_EXPIRE}"
  fi
}

clean_certs() {
  if [ "$CERT_VERBOSE" = "1" ] ; then
    echo "Removing certificates in ${CERT_PATH} for ${CERT_NAME}"
  fi
  rm -rf "${CERT_PATH}/live/${CERT_NAME}"
  rm -rf "${CERT_PATH}/archive/${CERT_NAME}"
  rm -f "${CERT_PATH}/renewal/${CERT_NAME}.conf"
}

create_certbot_cert() {
  if [ "$CERT_VERBOSE" = "1" ] ; then
    echo "create certbot certificate"
  fi
}

wait_for_webserver() {
  if [ "$CERT_VERBOSE" = "1" ] ; then
    echo "Attempting connection to ${cert_domains}"
    echo "Max attempts = ${MAX_CONNECT_TRIES}"
  fi
  count=0;
  while [ ${count} -lt ${MAX_CONNECT_TRIES} ] ; do
    if [ "${CERT_VERBOSE}" = "1" ] ; then
      echo "Connection attempt ${count}"
    fi
    if curl -I "http://${cert_domains}" 2>&1 | grep -w "200\|301" ; then
      if [ "$CERT_VERBOSE" = "1" ] ; then
        echo "${cert_domains} is up."
      fi
      return 0;
    fi
    let "count+=1"
    sleep 15
  done
  echo "Failed to connect to ${cert_domains}" >2
  return 1;
}
