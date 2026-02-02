#! /usr/bin/env bash
set -euo pipefail

delete-files () {
  # Deletes the specified files
  for file in "$@" ; do
    if [[ -f "$file" ]] ; then
      echo "Removing $file"
      sudo rm -rf $file >/dev/null 2>&1
    fi
  done
}

kill-services () {
  # Stops and disables the specified services
  for service in "$@" ; do
    if systemctl is-active $service ; then
      echo "Stopping service $service"
      sudo systemctl stop $service 2>&1 >/dev/null
    fi
    if systemctl is-enabled $service ; then
      echo "Disabling service $service"
      sudo systemctl disable $service
    fi
  done
}

# Stop and remove The Combine
echo "Stopping The Combine services"
kill-services k3s create_ap
echo "Deleting The Combine files"
delete-files ${HOME}/thecombine ${HOME}/.config/combine /usr/local/bin/combinectl

# Stop and remove support tools
echo "Stopping display-eth services"
kill-services display-eth.service display-eth.timer
echo "Deleting display-eth files"
delete-files /lib/systemd/system/display-eth.service /lib/systemd/system/display-eth.timer

# Uninstall k3s
if [[ -x /usr/local/bin/k3s-uninstall.sh ]] ; then
  echo "Uninstalling k3s"
  /usr/local/bin/k3s-uninstall.sh
fi

# Remove network configurations
if nmcli c show dummy-vip >/dev/null 2>&1 ; then
  echo "Removing dummy-vip"
  sudo nmcli c delete dummy-vip
fi

# Delete create_ap files
echo "Deleting create_ap files"
delete-files /etc/create_ap /usr/lib/systemd/system/create_ap.service
