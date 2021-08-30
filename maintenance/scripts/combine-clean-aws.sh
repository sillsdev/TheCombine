#!/bin/bash

######################################################
# Script to delete old backups from the AWS S3 bucket
######################################################

set -e

usage() {
  cat <<USAGE
  Usage: $0 [options]
     Removes old Combine backups from the AWS S3 bucket
  Options:
    -h, --help:
          print this message
    -d, --dry-run:
          print the commands to remove old backups instead of executing them
    -v, --verbose:
          print extra internal variable values to help with debugging

  Environment Variables:
    The script uses the following environment variables to determine how to cleanup
    the AWS S3 bucket:
     aws_bucket (required):
           URI of the AWS Bucket where the backups are stored

     combine_host (required):
           Name of the host for the combine with '.' characters replaced with '-'
           characters.  This is used to select the backups that shall be considered
           for pruning.

     max_backups:
           number of backups to keep for the host being cleaned up.  Default = 3
  Caveats:
    This script assumes that the backups have been created by the combine-backup
    script; specifically, that:
      1. The name of the backup is of the form:
          hostname-date.tar.gz
      2. Periods in the hostname are converted to dashes
      3. When the backups are sorted by name, they are in chronological order
         with the oldest backup first.
USAGE
}

DRYRUN=0
while [[ $# -gt 0 ]] ; do
  arg="$1"
  shift

  case ${arg} in
    -h|--help)
      usage
      exit 0
      ;;
    -d|--dry-run)
      DRYRUN=1
      ;;
    -v|--verbose)
      VERBOSE=1
      ;;
    *)
      echo "Unrecognized argument: ${arg}"
      usage
      exit 1
      ;;
  esac
done

max_backups=${max_backups:=3}

AWS_BACKUPS=($(/usr/local/bin/aws s3 ls s3://${aws_bucket} --recursive | grep "${backup_filter}" | sed "s/[^\/]*\/\(.*\)/\1/" | sort))
NUM_BACKUPS=${#AWS_BACKUPS[@]}

if [[ $VERBOSE -eq 1 ]] ; then
  echo "max_backups: " $max_backups
  echo "NUM_BACKUPS: " $NUM_BACKUPS
  echo "LIST OF BACKUPS:"
  for backup in ${AWS_BACKUPS[@]}
  do
    echo "   $backup"
  done
fi

if [[ ${NUM_BACKUPS} -gt ${max_backups} ]] ; then
  loop_limit=$(( ${NUM_BACKUPS} - ${max_backups} ))

  for (( bu=0; bu < $loop_limit; bu++ )) ; do
    cmd="/usr/local/bin/aws s3 rm s3://${aws_bucket}/${AWS_BACKUPS[${bu}]}"
    if [[ $DRYRUN -eq 1 ]] ; then
      echo "$cmd"
    else
      $cmd
    fi
  done
fi
