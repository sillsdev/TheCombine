#!/bin/bash

set -e

# Backup the CombineDatabase and the .CombineFiles in the backend
combine_backup.py
# Cleanup the old backups stored in AWS S3 service
combine-clean-aws.sh
