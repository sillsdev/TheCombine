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
   -c, --copyid
              will use ssh-copy-id to copy your id to user@machinename
              so that you do not need to enter your password to connect

   -h, --help
              print this message

   -i, --install
              run the installation portion of the playbook

   -t, --test
              run the test portion of the playbook
.EOM
}

COPYID=0
TAGS=""
declare -a TagList
while [ "$#" -gt 0 ]; do
  case $1 in
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

echo "Setting up $TARGET"

if [ "$COPYID" -eq 1 ] ; then
  echo "Copying ssh id to $USER@$MACHINE"
  ssh-copy-id "$USER@$MACHINE"
fi
CMD_STRING="ansible-playbook -i hosts playbook_setup.yml --limit $MACHINE -u $USER -K ${TAGS}"
echo -e "Running \"${CMD_STRING}\""
${CMD_STRING}
