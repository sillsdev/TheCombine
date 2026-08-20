#! /usr/bin/env bash

usage () {
  cat << .EOM
  Usage:
    combinectl COMMAND [parameters]

    Commands:
      help:     Print this usage message.
      start:    Start the combine services.
      stop:     Stop the combine services.
      status:   List the status for the combine services.
      cert:     Print the expiration date for the web certificate.
      update release-number:
                Update the version of The Combine to the "release-number"
                specified.  You can see the number of the latest release
                at https://github.com/sillsdev/TheCombine/releases.

                Note that not all releases can be updated this way.  If
                The Combine does not run properly, download and run the
                updated install package.
      wifi [wifi-passphrase]:
                If no parameters are provided, display the wifi
                passphrase.  If a new passphase is provided, the
                wifi passphrase is updated to the new phrase.
                If your passphrase has spaces or special characters,
                it is best to enclose your pass phrase in quotation marks ("").

    If the command is omitted or unrecognized, this usage message is
    printed.
.EOM
}

# Get the name of the first wifi interface.  In general,
# this script assumes that there is a single WiFi interface
# installed.
get-wifi-if () {
  IFS=$'\n' WIFI_DEVICES=( $(nmcli d | grep "^wl") )
  if [[ ${#WIFI_DEVICES[@]} -gt 0 ]] ; then
    IFS=' ' read -r -a IFNAME <<< "${WIFI_DEVICES[0]}"
    echo "${IFNAME[0]}"
  else
    echo ""
  fi
}

# Restart a WiFi connection that was saved previously
restore-wifi-connection () {
  if [ -f "${CACHED_WIFI_CONN}" ] ; then
    WIFI_CONN=`cat ${CACHED_WIFI_CONN}`
    if [ "$WIFI_CONN" != "--" ] ; then
      echo "Restoring connection ${WIFI_CONN}"
      sudo nmcli c up "${WIFI_CONN}"
    fi
  fi
}

# Save the current WiFi connection and then shut it down
save-wifi-connection () {
  # get the name of the WiFi Connection
  WIFI_CONN=`nmcli d show "$WIFI_IF" | grep "^GENERAL.CONNECTION" | sed "s|^GENERAL.CONNECTION:  *||"`
  # save it so we can restore it later
  echo "$WIFI_CONN" > ${CACHED_WIFI_CONN}
  if [ "$WIFI_CONN" != "--" ] ; then
    sudo nmcli c down "$WIFI_CONN"
  fi
}

# Print the expiration date of the TLS Certificate
combine-cert () {
  SECRET_NAME=`kubectl -n thecombine get secrets --field-selector type=kubernetes.io/tls -o name`
  CERT_DATA=`kubectl -n thecombine get $SECRET_NAME -o "jsonpath={.data['tls\.crt']}"`
  echo $CERT_DATA | base64 -d | openssl x509 -enddate -noout| sed -e "s/^notAfter=/Web certificate expires at /"
}

# Report whether the Kubernetes API is serving requests.  The k3s unit becomes
# active before the API is up, so an active unit alone is not enough.
cluster-ready () {
  kubectl get --raw='/readyz' --request-timeout=10s > /dev/null 2>&1
}

# Wait up to two minutes for the Kubernetes API to serve requests.
wait-for-cluster () {
  ATTEMPTS=0
  until cluster-ready ; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [[ ${ATTEMPTS} -ge 60 ]] ; then
      return 1
    fi
    sleep 2
  done
  return 0
}

# Print "name requested available" for every deployment in the namespace.
# availableReplicas is absent, rather than 0, when none are available.
combine-deployments () {
  kubectl -n thecombine get deployments 2> /dev/null \
    -o 'jsonpath={range .items[*]}{.metadata.name} {.spec.replicas} {.status.availableReplicas}{"\n"}{end}'
}

# Restore the deployment replica counts saved by stop-combine-deployments.  The
# counts live in a local file, so fall back to one replica each when it is
# missing: k3s can be started without combinectl, which would otherwise leave
# the deployments scaled to zero with nothing to bring them back.
start-combine-deployments () {
  if ! wait-for-cluster ; then
    echo "The cluster is not responding; run \"combinectl start\" again." >&2
    return
  fi
  DEPLOY_STATUS=$(combine-deployments)
  if [[ -z ${DEPLOY_STATUS} ]] ; then
    return
  fi
  if [ -f "${CACHED_REPLICAS}" ] ; then
    REPLICA_LIST=$(cat "${CACHED_REPLICAS}")
  else
    REPLICA_LIST=$(awk '$2 == 0 { print $1, 1 }' <<< "${DEPLOY_STATUS}")
    if [[ -z ${REPLICA_LIST} ]] ; then
      return
    fi
    echo "No saved replica counts; starting one replica of each deployment."
  fi
  echo "Starting The Combine deployments."
  RESTORE_FAILED=0
  while read -r DEPLOYMENT REPLICAS ; do
    if [[ -z ${DEPLOYMENT} || -z ${REPLICAS} ]] ; then
      continue
    fi
    if ! kubectl -n thecombine scale "deployment/${DEPLOYMENT}" --replicas="${REPLICAS}" > /dev/null ; then
      echo "Could not start deployment/${DEPLOYMENT}." >&2
      RESTORE_FAILED=1
    fi
  done <<< "${REPLICA_LIST}"
  # Keep the counts for the next attempt if any deployment was not restored.
  if [[ ${RESTORE_FAILED} -eq 0 ]] ; then
    rm -f "${CACHED_REPLICAS}"
  fi
}

# Scale The Combine deployments to zero and wait for their pods to exit.  The
# k3s service is patched to KillMode=mixed, so stopping it SIGKILLs whatever is
# still running, which can be the database part way through its startup setup.
stop-combine-deployments () {
  DEPLOY_STATUS=$(combine-deployments)
  if [[ -z ${DEPLOY_STATUS} ]] ; then
    return
  fi
  # Only record the deployments that are running, so that stopping The Combine
  # when it's already stopped doesn't lose the counts.
  REPLICA_LIST=$(awk '$2 > 0 { print $1, $2 }' <<< "${DEPLOY_STATUS}")
  if [[ -n ${REPLICA_LIST} ]] ; then
    echo "${REPLICA_LIST}" > "${CACHED_REPLICAS}"
  fi
  echo "Stopping The Combine deployments."
  kubectl -n thecombine scale deployment --all --replicas=0 > /dev/null
  # A selector-based "kubectl wait" fails immediately when nothing matches it,
  # so only wait when there are pods left to wait for.
  if [[ -n $(kubectl -n thecombine get pods -l combine-component --no-headers 2> /dev/null) ]] ; then
    if ! kubectl -n thecombine wait --for=delete pod -l combine-component \
        --timeout=2m > /dev/null 2>&1 ; then
      echo "The Combine did not stop within 2 minutes; stopping anyway." >&2
    fi
  fi
}

# Start The Combine services
combine-start () {
  echo "Starting The Combine."
  if ! systemctl is-active --quiet create_ap ; then
    save-wifi-connection
    sudo systemctl start create_ap
    sudo systemctl restart systemd-resolved
  fi
  if ! systemctl is-active --quiet k3s ; then
    sudo systemctl start k3s
  fi
  start-combine-deployments
}

# Stop The Combine services and restore the WiFI
# connection if needed.
combine-stop () {
  echo "Stopping The Combine."
  if systemctl is-active --quiet k3s ; then
    stop-combine-deployments
    sudo systemctl stop k3s
  fi
  if systemctl is-active --quiet create_ap ; then
    sudo systemctl stop create_ap
    restore-wifi-connection
    sudo systemctl restart systemd-resolved
  fi
}

# Print the status of The Combine services.  When the cluster is up, also
# distinguish between The Combine being uninstalled, incompletely installed,
# scaled down, still starting, and fully running, then print the status of the
# deployments in the "thecombine" namespace.
#
# Always exits 0; install-combine.sh calls this under "set -e".
combine-status () {
  if systemctl is-active --quiet create_ap ; then
    echo "WiFi hotspot is Running."
  else
    echo "WiFi hotspot is Stopped."
  fi

  if ! systemctl is-active --quiet k3s ; then
    echo "The Combine is Stopped."
    return 0
  fi

  if ! cluster-ready ; then
    echo "The Combine is Starting; the Kubernetes cluster is not ready yet."
    echo "Wait a minute, then run \"combinectl status\" again."
    return 0
  fi

  DEPLOY_STATUS=$(combine-deployments)
  if [[ -z ${DEPLOY_STATUS} ]] ; then
    echo "The Combine is Not Installed; the Kubernetes cluster is running, but"
    echo "the \"thecombine\" namespace has no deployments."
    echo "Download and run the install package to install The Combine."
    return 0
  fi

  MISSING=()
  for DEPLOYMENT in "${COMBINE_DEPLOYMENTS[@]}" ; do
    if ! grep -q "^${DEPLOYMENT} " <<< "${DEPLOY_STATUS}" ; then
      MISSING+=( "${DEPLOYMENT}" )
    fi
  done

  # Total requested replicas, to tell a scaled down Combine from a running one,
  # and the deployments that do not have all of the replicas they asked for.
  REQUESTED=0
  PENDING=()
  while read -r NAME WANT HAVE ; do
    if [[ -z ${NAME} ]] ; then
      continue
    fi
    REQUESTED=$(( REQUESTED + ${WANT:-0} ))
    if [[ ${HAVE:-0} -lt ${WANT:-0} ]] ; then
      PENDING+=( "${NAME}" )
    fi
  done <<< "${DEPLOY_STATUS}"

  if [[ ${#MISSING[@]} -gt 0 ]] ; then
    echo "The Combine is Incomplete; missing deployment(s): ${MISSING[*]}."
    echo "Download and run the install package to repair the installation."
  elif [[ ${REQUESTED} -eq 0 ]] ; then
    echo "The Combine is Stopped; the cluster is up but its services are"
    echo "scaled down.  Run \"combinectl start\" to start them."
  elif [[ ${#PENDING[@]} -gt 0 ]] ; then
    echo "The Combine is Starting; waiting for: ${PENDING[*]}."
  else
    echo "The Combine is Running."
  fi
  kubectl -n thecombine get deployments
  return 0
}

# Update the image used in each of the deployments in The Combine.  This
# is akin to our current update process for Production and QA servers.  It
# does *not* update any configuration files or secrets.
combine-update () {
  echo "Updating The Combine to $1"
  IMAGE_TAG=$1
  while [[ ! $IMAGE_TAG =~ ^v[0-9]+\.[0-9]+\.[0-9]+ ]] ; do
    echo "$IMAGE_TAG doesn't look like a valid version."
    read -p "Enter a new release number, for example, v1.2.0: " IMAGE_TAG
  done
  kubectl -n thecombine set image deployment/database database="public.ecr.aws/thecombine/combine_database:$IMAGE_TAG"
  kubectl -n thecombine set image deployment/backend backend="public.ecr.aws/thecombine/combine_backend:$IMAGE_TAG"
  kubectl -n thecombine set image deployment/frontend frontend="public.ecr.aws/thecombine/combine_frontend:$IMAGE_TAG"
  kubectl -n thecombine set image deployment/maintenance maintenance="public.ecr.aws/thecombine/combine_maint:$IMAGE_TAG"
}

# Print the current password for the WiFi Access point
combine-wifi-list-password () {
  WIFI_PASSWD=`grep PASSPHRASE ${WIFI_CONFIG} | sed "s/PASSPHRASE=//g"`
  echo "WiFi Password is \"${WIFI_PASSWD}\""
}

# Set the password for the WiFi Access point
combine-wifi-set-password () {
  # Check that the passphrase is at least 8 characters long
  if [[ ${#1} -ge 8 ]] ; then
    sudo sed -i "s/PASSPHRASE=.*/PASSPHRASE=$1/" ${WIFI_CONFIG}
    if systemctl is-active --quiet create_ap ; then
      sudo systemctl restart create_ap
      sudo systemctl restart systemd-resolved
    fi
    combine-wifi-list-password
  else
    echo "Wifi password must be at least 8 characters long."
  fi
}

# Main script entrypoint
# The deployments that make up The Combine, used to detect an installation that
# is missing components.  Matches the list in install-combine.sh.
COMBINE_DEPLOYMENTS=(backend database frontend maintenance)
WIFI_IF=$(get-wifi-if)
WIFI_CONFIG=/etc/create_ap/create_ap.conf
export KUBECONFIG=${HOME}/.kube/config
COMBINE_CONFIG=${HOME}/.config/combine
CACHED_WIFI_CONN=${COMBINE_CONFIG}/wifi-connection.txt
CACHED_REPLICAS=${COMBINE_CONFIG}/deployment-replicas.txt

# Make sure config directory exists
mkdir -p "${COMBINE_CONFIG}"

# Print usage if command is missing
if [[ $# -eq 0 ]] ;  then
  usage
  exit 0
fi

case "$1" in
  help)
    usage;;
  start)
    combine-start;;
  stop)
    combine-stop;;
  stat*)
    combine-status;;
  cert*)
    combine-cert;;
  update)
    combine-update $2;;
  wifi)
    if [[ $# -eq 1 ]] ; then
      combine-wifi-list-password
    else
      combine-wifi-set-password $2
    fi
    ;;
  *)
    echo -e "Unrecognized command: \"$1\".\n"
    usage;;
esac
