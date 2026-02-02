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
           number of days of daily backups to keep for the host being cleaned up.
           Default = 6

     max_monthly_backups:
           number of months of monthly backups (1st of month) to keep for the host 
           being cleaned up.  Default = 6
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

# Prepend 's3://' to $aws_bucket if it is needed.
[[ $aws_bucket =~ ^s3:// ]] || aws_bucket=s3://${aws_bucket}

# Set defaults for backup retention
max_backups=${max_backups:=6}
max_monthly_backups=${max_monthly_backups:=6}

# Get all backups sorted by name (which is chronological)
AWS_BACKUPS=($(/usr/local/bin/aws s3 ls ${aws_bucket} --recursive | grep "${backup_filter}" | sed "s/[^\/]*\/\(.*\)/\1/" | sort))
NUM_BACKUPS=${#AWS_BACKUPS[@]}

# Calculate date thresholds based on configured retention (in YYYY-MM-DD format)
DAILY_THRESHOLD=$(date -d "${max_backups} days ago" +%Y-%m-%d 2>/dev/null || date -v-${max_backups}d +%Y-%m-%d)
MONTHLY_THRESHOLD=$(date -d "${max_monthly_backups} months ago" +%Y-%m-%d 2>/dev/null || date -v-${max_monthly_backups}m +%Y-%m-%d)

if [[ $VERBOSE -eq 1 ]] ; then
  echo "max_backups: $max_backups"
  echo "max_monthly_backups: $max_monthly_backups"
  echo "NUM_BACKUPS: $NUM_BACKUPS"
  echo "DAILY_THRESHOLD: $DAILY_THRESHOLD"
  echo "MONTHLY_THRESHOLD: $MONTHLY_THRESHOLD"
  echo "LIST OF BACKUPS:"
  for backup in ${AWS_BACKUPS[@]}
  do
    echo "   $backup"
  done
fi

# Determine which backups to keep
# We keep:
# 1. All backups from the last max_backups days
# 2. Backups from the first day of the month for the last max_monthly_backups months
declare -A KEEP_BACKUPS

for backup in ${AWS_BACKUPS[@]}
do
  # Extract date from backup filename
  # Format: hostname-YYYY-MM-DD-HH-MM-SS.tar.gz
  # Extract the date portion using regex
  if [[ $backup =~ ^${combine_host}-([0-9]{4}-[0-9]{2})-([0-9]{2})(-[0-9]{2})+\.tar\.gz$ ]] ; then
    YEAR_MONTH=${BASH_REMATCH[1]}
    DAY=${BASH_REMATCH[2]}
    
    # Extract date in YYYY-MM-DD format for comparison
    BACKUP_DATE="${YEAR_MONTH}-${DAY}"
    
    # Check if backup is from the last max_backups days
    if [[ "$BACKUP_DATE" > "$DAILY_THRESHOLD" ]] ; then
      KEEP_BACKUPS[$backup]=1
      if [[ $VERBOSE -eq 1 ]] ; then
        echo "KEEP (last ${max_backups} days): $backup"
      fi
    # Check if backup is from first day of month and within last max_monthly_backups months
    elif [[ "$BACKUP_DATE" > "$MONTHLY_THRESHOLD" ]] && [[ $DAY == "01" ]] ; then
      KEEP_BACKUPS[$backup]=1
      if [[ $VERBOSE -eq 1 ]] ; then
        echo "KEEP (1st of month): $backup"
      fi
    else
      if [[ $VERBOSE -eq 1 ]] ; then
        echo "DELETE: $backup"
      fi
    fi
  else
    # If we can't parse the date, keep it to be safe
    KEEP_BACKUPS[$backup]=1
    if [[ $VERBOSE -eq 1 ]] ; then
      echo "KEEP (cannot parse): $backup"
    fi
  fi
done

# Delete backups that are not in the keep list
for backup in ${AWS_BACKUPS[@]}
do
  if [[ ! ${KEEP_BACKUPS[$backup]} ]] ; then
    cmd="/usr/local/bin/aws s3 rm ${aws_bucket}/${backup}"
    if [[ $DRYRUN -eq 1 ]] ; then
      echo "$cmd"
    else
      $cmd
    fi
  fi
done
