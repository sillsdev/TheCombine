#! /bin/bash

####################################################
# Initialize all the variables used by these scripts
####################################################
init_vars() {
  # set variables to their default values if they are not
  # specified
  CERT_STORE=${CERT_STORE:="/etc/cert_store"}
  # Folder for certicates as configured by the Nginx webserver
  CERT_EMAIL=${CERT_EMAIL:=""}
  CERT_STAGING=${CERT_STAGING:=0}
  MAX_CONNECT_TRIES=${MAX_CONNECT_TRIES:=15}
  if [ "${CERT_MODE}" = "self-signed" ] ; then
    SELF_SIGNED_EXPIRE=3650
    CERT_MIN_DAYS_TO_EXPIRE=10
  else
    SELF_SIGNED_EXPIRE=1
    CERT_MIN_DAYS_TO_EXPIRE=1
  fi
  # create $cert_domains as an array of domain names
  IFS=" " read -r -a cert_domains <<< "${CERT_DOMAINS}"
  debug_log "Self-signed Certificates stored in ${CERT_STORE}"
  debug_log "Certificate name: ${SERVER_NAME}"
  debug_log "Domains: ${cert_domains[*]}"
  debug_log "Certificates expire in ${SELF_SIGNED_EXPIRE}"
  debug_log "Minimum days before renewal: ${CERT_MIN_DAYS_TO_EXPIRE}"

  CERTBOT_DIR="/etc/letsencrypt/live/${SERVER_NAME}"
  # Path where the self-signed certificates are stored
  SELF_SIGNED_PATH="${CERT_STORE}/selfsigned/${SERVER_NAME}"
  NGINX_CERT_PATH="${CERT_STORE}/nginx/${SERVER_NAME}"
}

init_cert_store() {
  # Create nginx, and selfsigned directories
  for subdir in  "nginx" "selfsigned" ; do
    mkdir -p "${CERT_STORE}/${subdir}"
  done
}

debug_log() {
  if [ "${CERT_VERBOSE}" = "1" ] ; then
    echo $*
  fi
}

update_link() {
  src=$1
  target=$2

  debug_log "linking ${src} to ${target}"
  link_target=`readlink ${target}`
  if [ "${link_target}" != "${src}" ] ; then
    if [ -L "${target}" ]; then
      rm "${target}"
      debug_log "   Old link removed"
    fi
    ln -s ${src} ${target}
  else
    debug_log "   ${target} already points to ${src}"
  fi

}

create_selfsigned_cert() {
  debug_log "Self-signed certificates are stored in ${SELF_SIGNED_PATH}"
  mkdir -p ${SELF_SIGNED_PATH}
  openssl req -x509 -nodes -newkey rsa:4096 -days ${SELF_SIGNED_EXPIRE} -keyout "${SELF_SIGNED_PATH}/privkey.pem" -out "${SELF_SIGNED_PATH}/fullchain.pem" -subj '/CN=localhost'
  debug_log "Created certificate in ${CERT_STORE} for ${cert_domains}"
  debug_log "Expires: "`openssl x509 -in "${SELF_SIGNED_PATH}/fullchain.pem" -noout -enddate`

  # Update Nginx link
  update_link "${SELF_SIGNED_PATH}" "${NGINX_CERT_PATH}"
}


renew_selfsigned_cert()
{
  CERT_FILE="${SELF_SIGNED_PATH}/fullchain.pem"
  debug_log "Checking for renewal of ${CERT_FILE}"

  CERT_MIN_SEC_TO_EXPIRE=$(( ${CERT_MIN_DAYS_TO_EXPIRE} * 3600 * 24 ))
  if [ -f ${CERT_FILE} ] ; then
    openssl x509 -noout -in "${CERT_FILE}" -checkend ${CERT_MIN_SEC_TO_EXPIRE} > /dev/null
    if [ "$?" = "1" ] ; then
      echo "Renewing the certificate for ${cert_domains}"
      create_selfsigned_cert
    fi
  else
    echo "Restoring the certificate for ${cert_domains}"
    create_selfsigned_cert
  fi
}

create_certbot_cert() {
  debug_log "### Requesting Let's Encrypt certificate for ${cert_domains} ..."

  # Select appropriate email arg
  if [ -z "${CERT_EMAIL}" ] ; then
    email_arg="--register-unsafely-without-email"
  else
    email_arg="--email ${CERT_EMAIL}"
  fi

  # Enable staging mode if needed
  if [ ${CERT_STAGING} != "0" ]; then staging_arg="--staging"; fi

  debug_log `pwd`
  cert_cmd="certbot certonly --webroot -w /var/www/certbot \
    ${staging_arg} \
    ${email_arg} \
    -d ${CERT_DOMAINS} \
    --rsa-key-size 4096 \
    --agree-tos \
    --non-interactive \
    --force-renewal"
  debug_log "$cert_cmd"
  if $cert_cmd ; then
    update_link "/etc/letsencrypt/live/${SERVER_NAME}" "${NGINX_CERT_PATH}"
  fi
}

wait_for_webserver() {
  debug_log "Attempting connection to ${cert_domains}"
  debug_log "Max attempts = ${MAX_CONNECT_TRIES}"
  count=0;
  while [ ${count} -lt ${MAX_CONNECT_TRIES} ] ; do
    debug_log "Connection attempt ${count}"
    if curl -I "http://${cert_domains}" 2>&1 | grep -w "200\|301" ; then
      debug_log "${cert_domains} is up."
      return 0;
    fi
    let "count+=1"
    sleep 10
  done
  echo "Failed to connect to ${cert_domains}" >2
  return 1;
}
