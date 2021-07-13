#!/bin/bash

echo "Creating templates for ${CERT_PROXY_DOMAINS} and ${CERT_ADDL_DOMAINS}"

################################################################
# The current model for TheCombine is that CERT_ADDL_DOMAINS
# only defined when TheCombine is being moved to a new URL.
# In this case, the environment variables are defined as:
#   SERVER_NAME:       New URL for TheCombine
#   CERT_ADDL_DOMAINS: Old URL(s) for TheCombine
# This script will generate a page that redirects the users to
# the new URL.
################################################################

if [ -f /etc/nginx/templates/url_moved.conf ] ; then
    if [ -n "${CERT_ADDL_DOMAINS}" ] ; then
        for ADDL_DOMAIN in ${CERT_ADDL_DOMAINS} ; do
            echo "Generating template for '${ADDL_DOMAIN}'"
            sed -e s/%SERVER_NAME%/${ADDL_DOMAIN}/ < /etc/nginx/templates/url_moved.conf > /etc/nginx/templates/${ADDL_DOMAIN}.conf.template
        done
        # Update the page for URL moved
        sed -e s/%SERVER_NAME%/${SERVER_NAME}/g < /etc/nginx/page_templates/url_moved_home.html > ${FRONTEND_HOST_DIR}/url_moved/index.html
    fi
fi

if [ -f /etc/nginx/templates/nuc.conf ] ; then
    if [ -n "${CERT_PROXY_DOMAINS}" ] ; then
        for PROXY_DOMAIN in ${CERT_PROXY_DOMAINS} ; do
            echo "Generating template for '${PROXY_DOMAIN}'"
            sed -e s/%SERVER_NAME%/${PROXY_DOMAIN}/ < /etc/nginx/templates/nuc.conf > /etc/nginx/templates/${PROXY_DOMAIN}.conf.template
        done
    fi
fi
