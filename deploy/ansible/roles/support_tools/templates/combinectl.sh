#! /usr/bin/env bash

usage () {
  cat << .EOM
  Usage:
    $0 COMMAND [parameters]

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

    If the command is omitted or unrecognized, this usage message is
    printed.
.EOM
}

save-wifi-connection () {
  # get the name of the WiFi Connection
  WIFI_CONN=`nmcli d show "$WIFI_IF" | grep "^GENERAL.CONNECTION" | sed "s|^GENERAL.CONNECTION:  *||"`
  # save it so we can restore it later
  echo "$WIFI_CONN" > ${COMBINE_CONFIG}/wifi_connection.txt
  if [ "$WIFI_CONN" != "--" ] ; then
    nmcli c down "$WIFI_CONN"
  fi
}

restore-wifi-connection () {
  if [ -f "${COMBINE_CONFIG}/wifi_connection.txt" ] ; then
    WIFI_CONN=`cat ${COMBINE_CONFIG}/wifi_connection.txt`
    echo "Restoring connection $WIFI_CONN"
    if [ "$WIFI_CONN" != "--" ] ; then
      nmcli c up "$WIFI_CONN"
    fi
  fi
}

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
}

combine-stop () {
  echo "Stopping The Combine."
  if systemctl is-active --quiet k3s ; then
    sudo systemctl stop k3s
  fi
  if systemctl is-active --quiet create_ap ; then
    sudo systemctl stop create_ap
    restore-wifi-connection
    sudo systemctl restart systemd-resolved
  fi
}

combine-status () {
  if systemctl is-active --quiet create_ap ; then
    echo "WiFi hotspot is Running."
  else
    echo "WiFi hotspot is Stopped."
  fi
  if systemctl is-active --quiet k3s ; then
    echo "The Combine  is Running."
    kubectl -n thecombine get deployments
  else
    echo "The Combine is Stopped."
  fi
}

combine-cert () {
  SECRET_NAME=`kubectl -n thecombine get secrets --field-selector type=kubernetes.io/tls -o name`
  CERT_DATA=`kubectl -n thecombine get $SECRET_NAME -o "jsonpath={.data['tls\.crt']}"`
  echo $CERT_DATA | base64 -d | openssl x509 -enddate -noout| sed -e "s/^notAfter=/Web certificate expires at /"
}

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

WIFI_IF={{ wifi_interfaces[0] }}
export KUBECONFIG=${HOME}/.kube/config
COMBINE_CONFIG=${HOME}/.config/combine

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
  *)
    echo -e "Unrecognized command: \"$1\".\n"
    usage;;
esac
