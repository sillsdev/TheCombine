#! /bin/bash

echo "Creating templates for ${ADDL_SERVER_PAGES}"

if [ -f /etc/nginx/templates/nuc.conf ] ; then
  if [ ! -z "${ADDL_SERVER_PAGES}" ] ; then
    for SERVER in ${ADDL_SERVER_PAGES} ; do
      echo "Generating template for '${SERVER}'"
      sed -e s/%SERVER_NAME%/${SERVER}/ < /etc/nginx/templates/nuc.conf > /etc/nginx/templates/${SERVER}.conf.template
    done
  fi
fi
