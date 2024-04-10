#! /usr/bin/env bash
set -eo pipefail

# Set the environment variables that are required by The Combine.
# In addition, the values are stored in a file so that they do not
# need to be re-entered on subsequent installations.
set-combine-env () {
  if [ ! -f "${CONFIG_DIR}/env" ] ; then
    # Generate JWT Secret Key
    COMBINE_JWT_SECRET_KEY=`LC_ALL=C tr -dc 'A-Za-z0-9*\-_@!' </dev/urandom | head -c 64; echo`
    # Collect values from user
    read -p "Enter AWS_ACCESS_KEY_ID: " AWS_ACCESS_KEY_ID
    read -p "Enter AWS_SECRET_ACCESS_KEY: " AWS_SECRET_ACCESS_KEY
    # write collected values and static values to config file
    cat <<.EOF > ${CONFIG_DIR}/env
    export COMBINE_JWT_SECRET_KEY="${COMBINE_JWT_SECRET_KEY}"
    export AWS_DEFAULT_REGION="us-east-1"
    export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
    export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"
    export COMBINE_SMTP_USERNAME="nobody"
.EOF
    chmod 600 ${CONFIG_DIR}/env
  fi
  source ${CONFIG_DIR}/env
}

# Create the virtual environment needed by the Python installation
# scripts
create-python-venv () {
  cd $INSTALL_DIR
  # Install required packages
  sudo apt install -y python3-pip python3-venv

  #####
  # Setup Python to run ansible
  python3 -m venv venv
  source venv/bin/activate
  python -m pip install --upgrade pip pip-tools
  python -m piptools sync requirements.txt
}

# Install Kubernetes engine and other supporting
# software
install-kubernetes () {
  # Let the user know what to expect
  cat << .EOM

  The next step sets up the software environment and WiFi Access Point
  for The Combine.  You will be prompted for your password with the prompt:

     BECOME password:
     
.EOM
  #####
  # Setup Kubernetes environment and WiFi Access Point
  cd ${INSTALL_DIR}/ansible

  ansible-playbook playbook_desktop_setup.yaml -K -e k8s_user=`whoami`
}

# Set the KUBECONFIG environment variable so that the cluster can
# be reached by the installation scripts.  It also starts the k3s
# service if it is not already running.
set-k3s-env () {
  #####
  # Setup kubectl configuration file
  K3S_CONFIG_FILE=${HOME}/.kube/config
  if [ ! -e ${K3S_CONFIG_FILE} ] ; then
    echo "Kubernetes (k3s) configuration file is missing." >&2
    exit 1
  fi
  export KUBECONFIG=${K3S_CONFIG_FILE}
  #####
  # Start k3s if it is not running
  if ! systemctl is-active --quiet k3s ; then
    sudo systemctl start k3s
  fi
}

# Install the public charts used by The Combine, specifically, cert-manager
# and nginx-ingress-controller
install-required-charts () {
  set-k3s-env
  #####
  # Install base helm charts
  helm repo add stable https://charts.helm.sh/stable
  helm repo add bitnami https://charts.bitnami.com/bitnami

  #####
  # Setup required cluster services
  cd ${INSTALL_DIR}
  . venv/bin/activate
  cd ${INSTALL_DIR}/scripts
  ./setup_cluster.py
  deactivate
}

# Install The Combine
install-the-combine () {
  #####
  # Setup The Combine
  cd ${INSTALL_DIR}
  . venv/bin/activate
  cd ${INSTALL_DIR}/scripts
  set-combine-env
  set-k3s-env
  ./setup_combine.py --tag ${COMBINE_VERSION} --repo public.ecr.aws/thecombine --target desktop
  deactivate
}

# Wait until all the combine deployments are "Running"
wait-for-combine () {
  # Wait for all combine deployments to be up
  while true ; do
    combine_status=`kubectl -n thecombine get deployments`
    # assert the The Combine is up; if any components are not up,
    # set it to false
    combine_up=true
    for deployment in frontend backend database maintenance ; do
      deployment_status=$(echo ${combine_status} | grep "${deployment}" | sed "s/^.*\([0-9]\)\/1.*/\1/")
      if [ "$deployment_status" == "0" ] ; then
        combine_up=false
        break
      fi
    done
    if [ ${combine_up} != true ] ; then
      sleep 5
    else
      break
    fi
  done
}

# Set the next value for STATE and record it in
# the STATE_FILE
next-state () {
  STATE=$1
  if [[ "${STATE}" == "Done" && -f "${STATE_FILE}" ]] ; then
    rm ${STATE_FILE}
  else
    echo -n ${STATE} > ${STATE_FILE}
  fi
}

#####
# Setup initial variables
INSTALL_DIR=`pwd`
# Create directory for configuration files 
CONFIG_DIR=${HOME}/.config/combine
mkdir -p ${CONFIG_DIR}

# See if we need to continue from a previous install
STATE_FILE=${CONFIG_DIR}/install-state
if [ -f ${STATE_FILE} ] ; then
  STATE=`cat ${STATE_FILE}`
else
  STATE=Pre-reqs
fi

# Parse arguments to customize installation
while (( "$#" )) ; do
  OPT=$1
  case $OPT in
    clean)
      next-state "Pre-reqs"
      if [ -f ${CONFIG_DIR}/env ] ; then
        rm ${CONFIG_DIR}/env
      fi
      ;;
    restart)
      next-state "Pre-reqs"
      ;;
    uninstall)
      next-state "Uninstall-combine"
      ;;
    update|u)
      next-state "Install-combine"
      ;;
    v*)
      if [[ $OPT =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9-]+\.[0-9]+)?$ ]] ; then
        COMBINE_VERSION="$OPT"
      else
        echo "Invalid version number, $OPT"
        exit 1
      fi
      ;;
    *)
      echo "Unrecognized option: $OPT" >&2
      ;;
  esac
  shift
done

# Check that we have a COMBINE_VERSION
if [ -z "${COMBINE_VERSION}" ] ; then
  echo "Combine version is not specified."
  exit 1
fi

create-python-venv
# Step through the installation stages
while [ "$STATE" != "Done" ] ; do
  case $STATE in
    Pre-reqs)
      install-kubernetes
      next-state "Restart"
      ;;
    Restart)
      next-state "Base-charts"
      if [ -f /var/run/reboot-required ] ; then
        echo -e "***** Restart required *****\n"
        echo -e "Rerun combine-installer.run after the system has been restarted.\n"
        read -p "Restart now? (Y/n) " RESTART
        if [[ -z $RESTART || $RESTART =~ ^[yY].* ]] ; then
          sudo reboot
        else
          # We don't call next-state because we don't want the $STATE_FILE
          # removed - we want the install script to resume with the recorded
          # state.
          STATE=Done
        fi
      fi
      ;;
    Base-charts)
      install-required-charts
      next-state "Install-combine"
      ;;
    Install-combine)
      install-the-combine
      next-state "Wait-for-combine"
      ;;
    Wait-for-combine)
      # Wait until all the combine deployments are up
      echo "Waiting for The Combine components to download."
      echo "This may take some time depending on your Internet connection."
      echo "Press Ctrl-C to interrupt."
      wait-for-combine
      next-state "Shutdown-combine"
      ;;
    Shutdown-combine)
      # Shut down the combine services
      combinectl stop
      # Disable combine services from starting at boot time
      sudo systemctl disable create_ap
      sudo systemctl disable k3s
      # Print the current status
      combinectl status
      next-state "Done"
      ;;
    Uninstall-combine)
      ${INSTALL_DIR}/scripts/uninstall-combine
      next-state "Done"
      ;;
    *)
      echo "Unrecognized STATE: ${STATE}"
      rm ${STATE_FILE}
      exit 1
      ;;
  esac
done
