#!/bin/bash

set -e

if [ -n "$clean_files_select" ]; then
  echo "kubectl exec deployment/backend -- find /home/app/${backend_files_subdir} ${clean_files_select} -delete"
fi

# Backup the CombineDatabase and the .CombineFiles in the backend
combine_backup.py
# Cleanup the old backups stored in AWS S3 service
combine-clean-aws.sh
