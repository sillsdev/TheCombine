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
until getent hosts "${BACKEND_HOST}" > /dev/null 2>&1 ; do
    # SECONDS is wall clock since this shell started, so the cap covers the time
    # getent spends blocking on resolver timeouts, not just the sleeps.
    if [ "${SECONDS}" -ge "${MAX_WAIT_SECONDS}" ] ; then
        # Start nginx anyway so that it reports the problem itself, rather than
        # leaving a container that is running but never serving.
        echo "'${BACKEND_HOST}' did not resolve after ${SECONDS}s"
        exit 0
    fi
    sleep 2
done
echo "'${BACKEND_HOST}' resolved after ${SECONDS}s"
