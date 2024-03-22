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
  if [ -f "${COMBINE_CONFIG}/wifi_connection.txt" ] ; then
    WIFI_CONN=`cat ${COMBINE_CONFIG}/wifi_connection.txt`
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
  echo "$WIFI_CONN" > ${COMBINE_CONFIG}/wifi_connection.txt
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
}

# Stop The Combine services and restore the WiFI
# connection if needed.
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

# Print the status of The Combine services.  If the combine is
# "up" then also print that status of the deployments in
# "thecombine" namespace.
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
WIFI_IF=$(get-wifi-if)
WIFI_CONFIG=/etc/create_ap/create_ap.conf
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
