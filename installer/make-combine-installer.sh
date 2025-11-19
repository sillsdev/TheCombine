#! /usr/bin/env bash
set -eo pipefail

# Reporting functions
info () {
  echo "INFO: $1"
}
warning () {
  echo "WARNING: $1" >&2
}
error () {
  echo "ERROR: $1" >&2
  exit 1
}

# cd to the directory where the script is installed
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

DEBUG=0
NET_INSTALL=0
# Parse arguments to customize installation
while (( "$#" )) ; do
  OPT=$1
  case $OPT in
    --debug)
      DEBUG=1
      ;;
    --net-install)
      NET_INSTALL=1
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

cd ../deploy

if [[ $NET_INSTALL == 0 ]] ; then
  if [ -z "${COMBINE_VERSION}" ] ; then
    error "COMBINE_VERSION is not set."
  fi

  # Setup Python virtual environment
  info "Setting up the Python virtual environment."
  if [ ! -f venv/bin/activate ] ; then
    # Virtual environment does not exist - create it
    python3 -m venv venv
  fi
  source venv/bin/activate
  # Update the environment if necessary
  python -m pip $((( DEBUG == 0)) && echo "-q") install pip==24.2 pip-tools==7.5.1
  python -m piptools sync $((( DEBUG == 0)) && echo "-q") requirements.txt

  # Package The Combine for "offline" installation
  info "Packaging low-bandwidth installer for $COMBINE_VERSION."
  TEMP_DIR=/tmp/images-$$
  pushd scripts
  ./package_images.py ${COMBINE_VERSION} ${TEMP_DIR} $((( DEBUG == 1 )) && echo "--debug")
  INSTALLER_NAME="combine-installer.run"
  popd
else
  # Package The Combine for network installation
  info "Packaging high-bandwidth installer."
  INSTALLER_NAME="combine-net-installer.run"
fi

# Remove unwanted folders
for DIR in venv scripts/__pycache__ ; do
  if [ -d $DIR ] ; then
    (( DEBUG == 1 )) && info "Removing ../deploy/$DIR/"
    rm -rf $DIR
  fi
done

cd ${SCRIPT_DIR}
makeself $((( DEBUG == 0)) && echo "--tar-quietly" ) ../deploy ${INSTALLER_NAME} "The Combine Installer" scripts/install-combine.sh ${COMBINE_VERSION}
if  [[ $NET_INSTALL == 0 ]] ; then
  makeself $((( DEBUG == 0)) && echo "--tar-quietly" ) --append ${TEMP_DIR} ${INSTALLER_NAME}
  rm -rf ${TEMP_DIR}
fi
