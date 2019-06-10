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
  echo "Usage: $0 [-c|--copyid|-h|--help|-t] user@machinename"
  echo "where:"
  echo "   -c"
  echo "   --copyid   will use ssh-copy-id to copy your id to user@machinename"
  echo "              so that you do not need to enter your password to connect"
  echo "   -h"
  echo "   --help     print this message"
  echo "   -t         test argument parsing of the script - does not setup the"
  echo "              target"

}

COPYID=0
JUST_TEST=0
while [ "$#" -gt 0 ]; do
  case $1 in
    "-c" | "--copyid")
        COPYID=1
        ;;
    "-h" | "--help")
        print_usage
        exit 0
        ;;
    "-t")
        JUST_TEST=1
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

if [[ ! ( -n "$USER" && -n "$MACHINE" ) ]] ; then
  print_usage
  exit 1
fi

if [ "$JUST_TEST" -eq 1 ] ; then
  echo "USER == $USER"
  echo "MACHINE == $MACHINE"
  echo "COPYID == $COPYID"
  exit 0
fi

echo "Setting up $TARGET"

if [ "$COPYID" -eq 1 ] ; then
  echo "Copying ssh id to $USER@$MACHINE"
  ssh-copy-id "$USER@$MACHINE"
fi
CMD_STRING="ansible-playbook -i hosts playbook_setup.yml --limit $MACHINE -u $USER -K"
echo -e "Running \"${CMD_STRING}\""
${CMD_STRING}
