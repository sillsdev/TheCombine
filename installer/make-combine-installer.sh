#! /usr/bin/env bash

# Warning and Error reporting functions
warning () {
  echo "WARNING: $1" >&2  
}
error () {
  echo "ERROR: $1" >&2  
  exit 1
}

# cd to the directory where the script is installed
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

NET_INSTALL=0
# Parse arguments to customize installation
while (( "$#" )) ; do
  OPT=$1
  case $OPT in
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

if [ -z "${COMBINE_VERSION}" ] ; then
  error "COMBINE_VERSION is not set."
fi
# setup Python virtual environment
cd ../deploy

if [[ $NET_INSTALL == 0 ]] ; then
  if [ ! -f venv/bin/activate ] ; then
    # virtual environment does not exist - create it
    python3 -m venv venv
  fi
  source venv/bin/activate
  # update the environment if necessary
  python -m pip install --upgrade pip pip-tools
  python -m piptools sync requirements.txt

  # Package the so that the Combine can be installed "offline"
  TEMP_DIR=/tmp/images-$$
  pushd scripts
  ./package_images.py ${COMBINE_VERSION} ${TEMP_DIR}
  INSTALLER_NAME="combine-installer.run"
  popd
  # create tarball for venv
  #
  # replace the current directory in the venv files with a string
  # that can be used to relocate the venv
  VENV_DIR=`pwd`/venv
  echo "VENV_DIR == ${VENV_DIR}"
  sed -i "s|${VENV_DIR}|%%VENV_DIR%%|g" venv/bin/*
  tar czf ${TEMP_DIR}/venv.tar.gz venv
  rm -rf venv
else
  # Package the so that the Combine can be installed over the network
  INSTALLER_NAME="combine-net-installer.run"
fi

cd ${SCRIPT_DIR}
makeself --tar-quietly ../deploy ${INSTALLER_NAME} "Combine Installer" scripts/install-combine.sh ${COMBINE_VERSION}
if  [[ $NET_INSTALL == 0 ]] ; then
  makeself --append ${TEMP_DIR} ${INSTALLER_NAME}
  rm -rf ${TEMP_DIR}
fi
