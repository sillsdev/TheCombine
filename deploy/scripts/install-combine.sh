#! /usr/bin/env bash
set -eo pipefail

#########################################################################################
#
# install-combine.sh is intended to install the Combine on an Ubuntu-based Linux machine.
# It should only be executed directly by developers. For general users, it is packaged in
# a stand-alone installer (see ./installer/README.md or ./installer/README.pdf).
#
# The options for this script and for the packaged installer are the same. Note that some
# additional dev options are available that aren't documented in the readme file:
#   - debug - show more verbose output for debugging.
#   - single-step - run the next "step" in the installation process and stop.
#   - start-at <step-name> - start at the step named <step-name> and run to completion.
#
#########################################################################################

# Warning and Error reporting functions
warning () {
  echo "WARNING: $1" >&2
}
error () {
  echo "ERROR: $1" >&2
  exit 1
}

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
    # Write collected values and static values to config file
    cat <<.EOF > ${CONFIG_DIR}/env
    export COMBINE_JWT_SECRET_KEY="${COMBINE_JWT_SECRET_KEY}"
    export AWS_DEFAULT_REGION="us-east-1"
    export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
    export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"
.EOF
    chmod 600 ${CONFIG_DIR}/env
  fi
  source ${CONFIG_DIR}/env
}

# Create the virtual environment needed by the Python installation scripts
create-python-venv () {
  cd $DEPLOY_DIR
  # Install required packages
  sudo apt install -y python3-pip python3-venv

  #####
  # Setup Python virtual environment
  echo "Setting up venv in ${DEPLOY_DIR}"
  python3 -m venv venv
  source venv/bin/activate
  echo "Install pip and pip-tools"
  python -m pip $((( DEBUG == 0)) && echo "-q") install --upgrade pip pip-tools
  echo "Install dependencies"
  python -m piptools sync $((( DEBUG == 0)) && echo "-q") requirements.txt
}

# Install Kubernetes engine and other supporting software
install-kubernetes () {
  # Let the user know what to expect
  cat << .EOM

  The next step sets up the software environment and WiFi Access Point
  for The Combine.  You will be prompted for your password with the prompt:

     BECOME password:
     
.EOM
  #####
  # Setup Kubernetes environment and WiFi Access Point
  cd ${DEPLOY_DIR}/ansible

  # Set -e/--extra-vars for ansible-playbook
  EXTRA_VARS="-e k8s_user=${whoami}"
  if [ -d "${DEPLOY_DIR}/airgap-images" ] ; then
    EXTRA_VARS="${EXTRA_VARS} -e install_airgap_images=true"
  fi
  
  ansible-playbook playbook_desktop_setup.yml -K ${EXTRA_VARS} $(((DEBUG == 1)) && echo "-vv")
}

# Set the KUBECONFIG environment variable so that the cluster can
# be reached by the installation scripts.  It also starts the k3s
# service if it is not already running.
set-k3s-env () {
  #####
  # Setup kubectl configuration file
  K3S_CONFIG_FILE=${HOME}/.kube/config
  if [ ! -e ${K3S_CONFIG_FILE} ] ; then
    error "Kubernetes (k3s) configuration file is missing."
  fi
  export KUBECONFIG=${K3S_CONFIG_FILE}
  #####
  # Start k3s if it is not running
  if ! systemctl is-active $(((DEBUG == 0)) && echo "--quiet") k3s ; then
    sudo systemctl start k3s
  fi
}

# Install the public charts used by The Combine
install-base-charts () {
  set-k3s-env
  #####
  # Install base helm charts
  helm repo add stable https://charts.helm.sh/stable
  helm repo add bitnami https://charts.bitnami.com/bitnami

  #####
  # Setup required cluster services
  cd ${DEPLOY_DIR}
  . venv/bin/activate
  cd ${DEPLOY_DIR}/scripts
  if [ -z "${HELM_TIMEOUT}" ] ; then
    SETUP_OPTS=""
  else
    SETUP_OPTS="--timeout ${HELM_TIMEOUT}"
  fi
  if [ -d "${DEPLOY_DIR}/airgap-charts" ] ; then
    ./setup_cluster.py ${SETUP_OPTS} --chart-dir ${DEPLOY_DIR}/airgap-charts
  else
    ./setup_cluster.py ${SETUP_OPTS}
  fi
  deactivate
}

# Install The Combine
install-the-combine () {
  #####
  # Setup The Combine
  cd ${DEPLOY_DIR}
  . venv/bin/activate
  cd ${DEPLOY_DIR}/scripts
  set-combine-env
  set-k3s-env
  ./setup_combine.py \
    $(((DEBUG == 1)) && echo "--debug") \
    --repo public.ecr.aws/thecombine \
    --tag ${COMBINE_VERSION} \
    --target desktop \
    ${SETUP_OPTS}
  deactivate
}

# Wait until all The Combine deployments are "Running"
wait-for-combine () {
  # Wait for all The Combine deployments to be up
  while true ; do
    combine_status=`kubectl -n thecombine get deployments`
    # Assert The Combine is up; if any components are not up, set it to false
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

# Set the next value for STATE and record it in the STATE_FILE
next-state () {
  STATE=$1
  if [[ "${STATE}" == "Done" && -f "${STATE_FILE}" ]] ; then
    rm ${STATE_FILE}
  else
    echo -n ${STATE} > ${STATE_FILE}
  fi
}

# Verify that the required network devices have been setup for Kubernetes cluster
wait-for-k8s-interfaces () {
  echo "Waiting for k8s interfaces: $@"
  for interface in $@ ; do
    while ! ip link show $interface > /dev/null 2>&1 ; do
      sleep 1
    done
  done
  echo "Interfaces ready"
}

#####
# Setup initial variables
DEPLOY_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/.." &> /dev/null && pwd )
# Create directory for configuration files 
CONFIG_DIR=${HOME}/.config/combine
mkdir -p ${CONFIG_DIR}
SINGLE_STEP=0
IS_SERVER=0
DEBUG=0

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
    debug)
      DEBUG=1
      ;;
    restart)
      next-state "Pre-reqs"
      ;;
    server)
      IS_SERVER=1
      ;;
    single-step)
      SINGLE_STEP=1
      ;;
    start-at)
      next-state $2
      shift
      ;;
    timeout)
      HELM_TIMEOUT=$2
      shift
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
        error "Invalid version number, $OPT"
      fi
      ;;
    *)
      warning "Unrecognized option: $OPT"
      ;;
  esac
  shift
done

# Check that we have a COMBINE_VERSION
if [ -z "${COMBINE_VERSION}" ] ; then
  error "Combine version is not specified."
fi

create-python-venv
# Step through the installation stages
while [ "$STATE" != "Done" ] ; do
  case $STATE in
    Pre-reqs)
      install-kubernetes
      wait-for-k8s-interfaces flannel.1 cni0
      next-state "Restart"
      ;;
    Restart)
      next-state "Base-charts"
      if [ -f /var/run/reboot-required ] ; then
        echo -e "***** Restart required *****\n"
        echo -e "Rerun The Combine installer after the system has been restarted.\n"
        read -p "Restart now? (Y/n) " RESTART
        if [[ -z $RESTART || $RESTART =~ ^[yY].* ]] ; then
          sudo reboot
        else
          # We don't call next-state because we don't want the $STATE_FILE removed;
          # we want the install script to resume with the recorded state.
          STATE=Done
        fi
      fi
      if [ "$SINGLE_STEP" == "1" ] ; then
        STATE=Done
      fi
      ;;
    Base-charts)
      install-base-charts
      next-state "Install-combine"
      if [ "$SINGLE_STEP" == "1" ] ; then
        STATE=Done
      fi
      ;;
    Install-combine)
      install-the-combine
      next-state "Wait-for-combine"
      if [ "$SINGLE_STEP" == "1" ] ; then
        STATE=Done
      fi
      ;;
    Wait-for-combine)
      # Wait until all The Combine deployments are up
      echo "Waiting for The Combine components to download and setup."
      echo "This may take some time depending on your Internet connection."
      echo "Press Ctrl-C to interrupt."
      wait-for-combine
      echo "The Combine was successfully setup!"
      next-state "Shutdown-combine"
      ;;
    Shutdown-combine)
      # If not being installed as a server,
      if [[ $IS_SERVER != 1 ]] ; then
        # Shut down The Combine services
        combinectl stop
        # Disable The Combine services from starting at boot time
        sudo systemctl disable create_ap
        sudo systemctl disable k3s
      fi
      # Print the current status
      combinectl status
      next-state "Done"
      ;;
    Uninstall-combine)
      ${DEPLOY_DIR}/scripts/uninstall-combine
      next-state "Done"
      ;;
    *)
      rm ${STATE_FILE}
      error "Unrecognized STATE: ${STATE}"
      ;;
  esac
done
