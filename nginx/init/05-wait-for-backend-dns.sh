#! /bin/bash

###############################################################################
# nginx resolves the hostnames in its proxy_pass directives when it loads its
# configuration, and exits if any of them cannot be resolved:
#
#   [emerg] host not found in upstream "backend"
#
# On a cold start the frontend container can be running before the cluster DNS
# can answer for the backend service, so wait for the name before starting.
###############################################################################

BACKEND_HOST=backend
MAX_WAIT_SECONDS=120

if getent hosts "${BACKEND_HOST}" > /dev/null 2>&1 ; then
    exit 0
fi

echo "Waiting up to ${MAX_WAIT_SECONDS}s for '${BACKEND_HOST}' to resolve"
WAITED=0
until getent hosts "${BACKEND_HOST}" > /dev/null 2>&1 ; do
    if [ "${WAITED}" -ge "${MAX_WAIT_SECONDS}" ] ; then
        # Start nginx anyway so that it reports the problem itself, rather than
        # leaving a container that is running but never serving.
        echo "'${BACKEND_HOST}' did not resolve after ${MAX_WAIT_SECONDS}s"
        exit 0
    fi
    sleep 2
    WAITED=$((WAITED + 2))
done
echo "'${BACKEND_HOST}' resolved after ${WAITED}s"
