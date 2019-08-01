#!/bin/bash

##########################
#
# setup-target.sh
#
# setup-target.sh will initialize an Ubuntu machine so that it can be used
# as backend for the Rapid Language Collection tool.
#
# Requirements
#  - target
#    * ssh-server
#
#  - host
#    * ssh-client
#    * ansible
#    * git
#
# Usage:
#    setup-target.sh user@machinename
#
# To Do:
#  - consider adding -d & -s options to specify whether installing on Ubuntu
#    Desktop or Server respectively.
#

function print_usage()
{
  cat << .EOM
Usage: $0 [options] user@machinename
 where:
   -b, --build
              will build/publish the UI and Backend server before deploying
              The Combine

   -c, --copyid
              will use ssh-copy-id to copy your id to user@machinename
              so that you do not need to enter your password to connect

   -h, --help
              print this message

   -i, --install
              run the installation portion of the playbook

   -t, --test
              run the test portion of the playbook

   -v <vaultpasswordfile>, --vault <vaultpasswordfile>
              use <vaultpasswordfile> for the vault password. If no password
              file is specified, the user will be prompted for the vault
              password when it is needed.
.EOM
}

COPYID=0
BUILDAPP=0
TAGS=""
VAULTPASSWORDFILE=""

declare -a TagList
while [ "$#" -gt 0 ]; do
  case $1 in
    "-b" | "--build")
        BUILDAPP=1
        ;;

    "-c" | "--copyid")
        COPYID=1
        ;;

    "-h" | "--help")
        print_usage
        exit 0
        ;;

    "-i" | "--install")
        TagList+=("install")
        ;;

    "-t" | "--test")
        TagList+=("test")
        ;;

    "-v" | "--vault")
        VAULTPASSWORDFILE=$2
        shift
        ;;

    -*)
        echo "option $1 not recognized - ignored"
        ;;

    *)
        TARGET=$1;
        ;;

  esac
  shift
done

if [[ -n "$TARGET" ]] ; then
  USER=`expr $TARGET : '\([^@]*\)@.*'`
  MACHINE=`expr $TARGET : '.*@\([^@]*\)$'`
fi

if [[ ${#TagList[@]} -gt 0 ]] ; then
  TAGS="--tags "$(IFS=, ; echo "${TagList[*]}")
fi

if [[ ! ( -n "$USER" && -n "$MACHINE" ) ]] ; then
  print_usage
  exit 1
fi

if [ "$BUILDAPP" -eq 1 ] ; then
  cd ..
  echo -e "Replacing \"localhost:5001\" with \"thewordcombine.org\" in src/backend/index.tsx"
  sed -i s/localhost\:5001/thewordcombine.org/ src/backend/index.tsx
  echo "Building app"
  npm install
  npm run build
  echo -e "Restoring src/backend/index.tsx"
  sed -i s/thewordcombine.org/localhost\:5001/ src/backend/index.tsx
  cd Backend
  dotnet publish -c Release
  cd ../deploy
fi

echo "Setting up $TARGET"

if [ "$COPYID" -eq 1 ] ; then
  echo "Copying ssh id to $USER@$MACHINE"
  ssh-copy-id "$USER@$MACHINE"
fi

VAULTPASSWORDOPTION=""
if [ -z "$VAULTPASSWORDFILE" ] ; then
  VAULTPASSWORDOPTION="--ask-vault-pass"
else
  VAULTPASSWORDOPTION="--vault-password-file $VAULTPASSWORDFILE"
fi

CMD_STRING="ansible-playbook -i hosts playbook_setup.yml --limit $MACHINE -u $USER -K ${TAGS} ${VAULTPASSWORDOPTION}"
echo -e "Running \"${CMD_STRING}\""
${CMD_STRING}
