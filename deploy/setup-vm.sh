#!/bin/bash

##################################################
# Shell script to initialize a PC to run the SIL
# Ansible scripts and install xForge
##################################################

PROJ_REPO="https://github.com/jmgrady/ubuntu-setup.git"
INSTALL_AP=0
DEPLOY_PROJ=0
PROJ_NAME="ubuntu_setup"
# Set the git options, e.g. --recurse-submodules
GIT_OPTS=""

printUsage()
{
  cat <<.EOM
Usage: $0 [options]

Options:
   --repo=<repository URL>
      Use the specified repository instead of the default SIL repo
   --deploy
      Run ansible playbooks to deploy the project on the localhost

The script sets up a target to be ready to run the SIL ansible playbooks.
It will:
 * update the apt cache and upgrade all installed packages
 * add the ansible PPA to sources
 * add the ansible repo key
 * install git and ansible
 * install nodejs 8.X and latest npm
 * clone the web-languageforge repository into ~/src
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
    --deploy) DEPLOY_PROJ=1;;
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

#echo Install NodeJS 8.X and latest npm
#wget -O- https://deb.nodesource.com/setup_8.x | sudo -E bash -
#sudo apt-get install -y nodejs

# Runs the rest of the script as non-root
set -eux

[ -d ~/src ] || mkdir ~/src

cd ~/src
if [ ! -d ${PROJ_NAME} ]; then
  git clone ${GIT_OPTS} ${PROJ_REPO}
else
  cd ${PROJ_NAME}
  git pull --ff-only --recurse-submodules
fi

if [ "$DEPLOY_PROJ" == "1" ] ; then
  ansible-playbook -i hosts playbook_setup.yml --limit localhost -K
fi
