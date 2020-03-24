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

function print_usage()
{
  cat << .EOM
Usage: $0 [options] user@machinename
 where:
   --copyid
              will use ssh-copy-id to copy your id to user@machinename
              so that you do not need to enter your password to connect

   -h, --help
              print this message and exit

   --vault <vaultpasswordfile>, --vault-password-file <vaultpasswordfile>
              use <vaultpasswordfile> for the vault password. If no password
              file is specified, the user will be prompted for the vault
              password when it is needed.

   machinename
              is the host name of the NUC

  user
              is the name of the user for logging into the NUC

  Unrecognized options are passed to the 'ansible-playbook' commands that are
  run at the end of the script.  An example of there this is useful is using the
  -i option to use an alternate host inventory file.
.EOM
}

set -euf -o pipefail

COPYID=0
VAULTPASSWORDFILE=""

declare -a ANSIBLE_OPTS

while [ "$#" -gt 0 ]; do
  case $1 in
    "--copyid")
        COPYID=1
        ;;

    "-h" | "--help")
        print_usage
        exit 0
        ;;

    "--vault" | "--vault-password-file")
        VAULTPASSWORDFILE=$2
        shift
        ;;

    *@*)
        TARGET=$1;
        ;;

    *)
        ANSIBLE_OPTS+=($1)
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
  exit 2
fi

echo "Setting up $TARGET"

if [ "$COPYID" -eq 1 ] ; then
  echo "Copying ssh id to $USER@$MACHINE"
  ssh-copy-id "$USER@$MACHINE"
fi

VAULTPASSWORDOPTION=""
if [ -z "$VAULTPASSWORDFILE" ] ; then
  if [[ ! -v ANSIBLE_VAULT_PASSWORD_FILE ]] ; then
    VAULTPASSWORDOPTION="--ask-vault-pass"
  fi
else
  VAULTPASSWORDOPTION="--vault-password-file $VAULTPASSWORDFILE"
fi

CMD_STRING="ansible-playbook ${ANSIBLE_OPTS[*]} playbook_root_keys.yml --limit $MACHINE -u $USER -K"
echo -e "Running:\n\t${CMD_STRING}"
${CMD_STRING}

CMD_STRING="ansible-playbook ${ANSIBLE_OPTS[*]} playbook_register_nuc.yml -K"
echo -e "Running:\n\t${CMD_STRING}"
${CMD_STRING}

CMD_STRING="ansible-playbook ${ANSIBLE_OPTS[*]} playbook_nuc.yml --limit $MACHINE -u $USER -K ${VAULTPASSWORDOPTION}"
echo -e "Running:\n\t${CMD_STRING}"
${CMD_STRING}
