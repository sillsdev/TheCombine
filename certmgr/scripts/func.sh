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

update_link() {
  src=$1
  target=$2

  echo "linking ${src} to ${target}"
  link_target=`readlink ${target}`
  if [ "${link_target}" != "${src}" ] ; then
    if [ -L "${target}" ]; then
      rm "${target}"
    fi
    ln -s ${src} ${target}
  fi

}

create_selfsigned_cert() {
  mkdir -p ${SELF_SIGNED_PATH}
  openssl req -x509 -nodes -newkey rsa:4096 -days ${SELF_SIGNED_EXPIRE} -keyout "${SELF_SIGNED_PATH}/privkey.pem" -out "${SELF_SIGNED_PATH}/fullchain.pem" -subj '/CN=localhost'
  # Update Nginx link
  update_link "${SELF_SIGNED_PATH}" "${NGINX_CERT_PATH}"
}


renew_selfsigned_cert()
{
  CERT_FILE="${SELF_SIGNED_PATH}/fullchain.pem"

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

  # Select appropriate email arg
  if [ -z "${CERT_EMAIL}" ] ; then
    email_arg="--register-unsafely-without-email"
  else
    email_arg="--email ${CERT_EMAIL}"
  fi

  # Enable staging mode if needed
  if [ ${CERT_STAGING} != "0" ]; then staging_arg="--staging"; fi

  cert_cmd="certbot certonly --webroot -w /var/www/certbot \
    ${staging_arg} \
    ${email_arg} \
    -d ${CERT_DOMAINS} \
    --rsa-key-size 4096 \
    --agree-tos \
    --non-interactive \
    --force-renewal"
  if $cert_cmd ; then
    update_link "/etc/letsencrypt/live/${SERVER_NAME}" "${NGINX_CERT_PATH}"
  fi
}

wait_for_webserver() {
  count=0;
  while [ ${count} -lt ${MAX_CONNECT_TRIES} ] ; do
    if curl -I "http://${cert_domains}" 2>&1 | grep -w "200\|301" ; then
      echo "${cert_domains} is up."
      return 0;
    fi
    let "count+=1"
    sleep 10
  done
  echo "Failed to connect to ${cert_domains}" >2
  return 1;
}
