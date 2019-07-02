#!/bin/bash

##################################################
# Shell script to initialize a VM to run the SIL
# Ansible scripts for TheCombine
##################################################

PROJ_REPO="https://github.com/sillsdev/TheCombine.git"
INSTALL_AP=0
DEPLOY_PROJ=0
PROJ_NAME="TheCombine"
# Set the git options, e.g. --recurse-submodules
GIT_OPTS="--recurse-submodules"

printUsage()
{
  cat <<.EOM
Usage: $0 [options]

Options:
   --repo=<repository URL>
      Use the specified repository instead of the default SIL repo

The script sets up a target to be ready to run the SIL ansible playbooks.
It will:
 * update the apt cache and upgrade all installed packages
 * add the ansible PPA to sources
 * add the ansible repo key
 * install git and ansible
 * install apache2 (to test port forwarding)
 * install build-essential (so that VBox Guest Additions can be installed)
 * install emacs
.EOM
  exit 2
}

##################################################
#
#   M A I N
#
##################################################


while [ "$#" -gt 0 ] ;
do
    case "$1" in
    --repo=*) if [[ "$1" =~ --repo=(.*) ]] ; then
                PROJ_REPO=${BASH_REMATCH[1]}
              else
                echo -e "Could not find repository name."
              fi;;
	  -?)			  printUsage;;
	  --help)		printUsage;;
	  *)        echo -e "Unknown Option: $1";;
    esac
    shift
done

sudo apt-get update
sudo apt-get -y install software-properties-common apt-transport-https
sudo add-apt-repository ppa:ansible/ansible
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5 # TODO move this to Ansible
sudo apt-get update
sudo apt-get -y install git ansible
# install apache2 so that we can verify that the vagrant port forwarding has
# been configured properly
sudo apt-get -y install apache2
# install build-essential so that Virtual Box Guest Additions can be installed
# - requires building of a kernel module
sudo apt-get -y install build-essential
# install emacs because Jim likes it for editing configuration files
sudo apt-get -y install emacs

# Runs the rest of the script as non-root
set -eux

if [ ! -d "${HOME}/src" ] ; then
  mkdir "${HOME}/src"
fi

cd ~/src
if [ ! -d "${PROJ_NAME}" ]; then
  git clone ${GIT_OPTS} ${PROJ_REPO}
else
  cd ${PROJ_NAME}
  git pull --ff-only --recurse-submodules
fi
