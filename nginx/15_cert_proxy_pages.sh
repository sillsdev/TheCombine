#! /bin/bash

echo "Creating templates for ${CERT_PROXY_DOMAINS} and ${CERT_ADDL_DOMAINS}"

if [ -f /etc/nginx/templates/nuc.conf ] ; then
  if [ ! -z "${CERT_ADDL_DOMAINS}" ] ; then
    for DOMAINS in ${CERT_ADDL_DOMAINS} ; do
      echo "Generating template for '${DOMAINS}'"
      sed -e s/%SERVER_NAME%/${DOMAINS}/ < /etc/nginx/templates/nuc.conf > /etc/nginx/templates/${DOMAINS}.conf.template
    done
  fi
  if [ ! -z "${CERT_PROXY_DOMAINS}" ] ; then
    for DOMAINS in ${CERT_PROXY_DOMAINS} ; do
      echo "Generating template for '${DOMAINS}'"
      sed -e s/%SERVER_NAME%/${DOMAINS}/ < /etc/nginx/templates/nuc.conf > /etc/nginx/templates/${DOMAINS}.conf.template
    done
  fi
fi
