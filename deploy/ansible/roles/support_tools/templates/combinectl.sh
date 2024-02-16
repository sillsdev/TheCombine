#! /usr/bin/env bash

usage () {
  cat << .EOM
  Usage:
    $0 COMMAND [parameters]

    Commands:
      help:     Print this usage message.
      start:    Start the combine services.
      stop:     Stop the combine services.
      auto:     Configure the combine services to start at boot time.
                Does not imply 'start'.
      noauto:   Configure the combine services to not start at boot time.
                Does not imply 'stop'.
      status:   List the status for the combine services.
      cert:     Print the expiration date for the web certificate.
      update release_number:
                Update the version of The Combine to the "release_number"
                specified.  You can see the number of the latest release
                at https://github.com/sillsdev/TheCombine/releases.

                Note that not all releases can be updated this way.  If
                The Combine fails to run properly, download and run the
                updated install package.

    If the command is omitted or unrecognized, this usage message is
    printed.
.EOM
}

combine_enable () {
  echo "Setting The Combine to start at boot."
  sudo systemctl enable create_ap
  sudo systemctl enable k3s
}

combine_disable () {
  echo "Setting The Combine to not start at boot."
  sudo systemctl disable create_ap
  sudo systemctl disable k3s
}

combine_start () {
  echo "Starting The Combine."
  sudo systemctl start create_ap
  sudo systemctl restart systemd-resolved
  sudo systemctl restart systemd-networkd
  sudo systemctl start k3s
  sudo ip link set ${WIFI_IF} up
}

combine_stop () {
  echo "Stopping The Combine."
  sudo systemctl stop k3s
  sudo systemctl stop create_ap
  sudo ip link set vip down
  sudo systemctl restart systemd-resolved
  sudo systemctl restart systemd-networkd
}

combine_status () {
  if systemctl is-enabled --quiet create_ap && systemctl is-enabled --quiet k3s ; then
    echo "The Combine starts automatically at boot time."
  else
    echo "The Combine does not start automatically."
  fi
  if systemctl is-active --quiet create_ap ; then
    echo "WiFi hotspot is UP."
  else
    echo "WiFi hotspot is DOWN."
  fi
  if systemctl is-active --quiet k3s ; then
    echo "The Combine  is UP."
    kubectl -n thecombine get deployments
  else
    echo "The Combine is DOWN."
  fi
}

combine_cert () {
  SECRET_NAME=`kubectl -n thecombine get secrets --field-selector type=kubernetes.io/tls -o name`
  CERT_DATA=`kubectl -n thecombine get $SECRET_NAME -o "jsonpath={.data['tls\.crt']}"`
  echo $CERT_DATA | base64 -d | openssl x509 -enddate -noout| sed -e "s/^notAfter=/Web certificate expires at /"
}

combine_update () {
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

if [[ $# -eq 0 ]] ;  then
  usage
  exit 0
fi

case "$1" in
  help)
    usage;;
  auto)
    combine_enable;;
  noauto)
    combine_disable;;
  start)
    combine_start;;
  stop)
    combine_stop;;
  stat*)
    combine_status;;
  cert*)
    combine_cert;;
  update)
    combine_update $2;;
  *)
    echo -e "Unrecognized command: \"$1\".\n"
    usage;;
esac
