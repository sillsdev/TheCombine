max_backups#!/bin/bash

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

LIST_ONLY="0"
while [[ $# -gt 0 ]] ; do
  arg="$1"
  shift

  case ${arg} in
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unrecognized argument: ${arg}"
      usage
      exit 1
      ;;
  esac
done

DATE_STR=`date +%Y-%m-%d-%H-%M-%S`
max_backups=${max_backups:=3}

AWS_BACKUPS=($(/usr/local/bin/aws s3 ls ${aws_bucket} --recursive --profile s3_read_write|grep --fixed-strings "${combine_host}"|sed "s/[^\/]*\/\(.*\)/\1/"|sort))
NUM_BACKUPS={{ '${#AWS_BACKUPS[@]}' }}

if [[ ${NUM_BACKUPS} -gt ${max_backups} ]] ; then
  loop_limit=$(( ${NUM_BACKUPS} - ${max_backups} ))

  for (( bu=0; bu < $loop_limit; bu++ )) ; do
    /usr/local/bin/aws s3 rm ${aws_bucket}/${AWS_BACKUPS[${bu}]} --profile s3_read_write
  done
fi
