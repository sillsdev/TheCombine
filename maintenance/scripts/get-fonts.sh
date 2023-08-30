#!/bin/bash

######################################################
# Script to run the get_fonts.py script
#
# This is provided as a bash shell script so that it
# can be easily invoked with a
#   kubectl exec ...
# command from a Kubernetes CronJob or Job resource.
######################################################

set -e

usage() {
  cat <<USAGE
  Usage: $0 [options]
     Runs the get_fonts.py script on the maintenance pod
  Options:
    -h, --help:
          print this message and then run get_fonts.py with the -h option

    All other options are passed to the get_fonts.py script.
    Caveat emptor.

  Environment Variables:
    When get_fonts.py is invoked, it will use the environment variables defined
    for the maintenance deployment.
USAGE
}

font_opts=()

while [[ $# -gt 0 ]] ; do
  arg="$1"
  shift

  case ${arg} in
    -h|--help)
      usage
      get_fonts.py -h
      exit 0
      ;;
    *)
      font_opts+=$1
      ;;
  esac
done

get_fonts.py ${font_opts[*]}
