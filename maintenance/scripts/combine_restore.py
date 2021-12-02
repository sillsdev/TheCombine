#!/usr/bin/env python3
"""
Restore The Combine from a backup stored in the AWS S3 service.

Restores The Combine database and backend files from a compressed tarball stored
in the AWS S3 service.  This script only applies to instances of The Combine running
in a Kubernetes cluster.  It can restore backups made from instances running under
Kubernetes or Docker.  This script requires the following environment variables to
be set:
  AWS_ACCESS_KEY_ID         The Access Key for the AWS S3 bucket where the backups
                            are stored
  AWS_SECRET_ACCESS_KEY:    The Secret Key (password) for the Access Key above
  AWS_ACCOUNT:              The 12-digit AWS Account number for the S3 bucket
  AWS_DEFAULT_REGION:       The AWS region for the S3 bucket
  backend_files_subdir      sub-directory where The Combine backend stores its local
                            files (relative to the home directory of the user)
  db_files_subdir           sub-directory where the database dump is stored
  aws_bucket                AWS S3 bucket for backups
"""

import argparse
import logging
import os
from pathlib import Path
import re
import sys
import tarfile
import tempfile
from typing import List, Tuple

from aws_backup import AwsBackup
from combine_app import CombineApp
import humanfriendly
from script_step import ScriptStep


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    parser = argparse.ArgumentParser(
        description="Restore TheCombine database and backend files from a file in AWS S3.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--verbose", action="store_true", help="Print intermediate values to aid in debugging"
    )
    parser.add_argument(
        "--clean", action="store_true", help="Clean out Backend files before restoring from backup"
    )
    parser.add_argument("--file", help="name of file in AWS S3 to be restored.")
    return parser.parse_args()


def aws_strip_bucket(obj_name: str) -> str:
    """Strip the bucket name from the beginning of the supplied object name."""
    match = re.match(r"^[^/]+/(.*)", obj_name)
    if match is not None:
        return match.group(1)
    return obj_name


def main() -> None:
    """Restore TheCombine from a backup stored in the AWS S3 service."""
    args = parse_args()
    if args.verbose:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)
    else:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.WARNING)
    combine = CombineApp()
    aws = AwsBackup(bucket=os.environ["aws_bucket"])
    step = ScriptStep()

    step.print("Prepare for the restore.")
    with tempfile.TemporaryDirectory() as restore_dir:
        restore_file = "combine-backup.tar.gz"

        if args.file:
            backup = args.file
        else:
            # Get the list of backups
            backup_list_output = aws.list().stdout.strip().split("\n")

            if len(backup_list_output) == 0:
                print(f"No backups available from {os.environ['aws_bucket']}")
                sys.exit(0)

            # Convert the list of backups to a more useful structure
            aws_backup_list: List[Tuple[str, str]] = []
            for backup_row in backup_list_output:
                backup_components = backup_row.split()
                aws_backup_list.append(
                    (
                        humanfriendly.format_size(int(backup_components[2])),
                        aws_strip_bucket(backup_components[3]),
                    )
                )

            # Print out the list of backups to choose from.  In the process,
            # update each line in the backup list to be the AWS S3 object name
            # and its (human-friendly) size.
            print("Backup List:")
            for i, backup_entry in enumerate(aws_backup_list):
                print(f"{i+1}: {backup_entry[1]} ({backup_entry[0]})")

            backup_num = int(
                input("Enter the number of the backup you would like to restore (0 = None):")
            )
            if backup_num == 0:
                print("No backup selected.  Exiting.")
                sys.exit(0)
            backup = aws_backup_list[backup_num - 1][1]

        step.print(f"Fetch the selected backup, {backup}.")

        aws.pull(backup, Path(restore_dir) / restore_file)

        step.print("Unpack the backup.")
        os.chdir(restore_dir)
        with tarfile.open(restore_file, "r:gz") as tar:
            tar.extractall()

        step.print("Restore the database.")
        db_pod = combine.get_pod_id("database")
        if not db_pod:
            print("Cannot find the database container.", file=sys.stderr)
            sys.exit(1)
        combine.kubectl(
            [
                "cp",
                os.environ["db_files_subdir"],
                f"{db_pod}:/",
            ]
        )

        combine.exec(
            db_pod,
            [
                "mongorestore",
                "--drop",
                "--gzip",
                "--quiet",
            ],
        )
        combine.exec(
            db_pod,
            [
                "rm",
                "-rf",
                os.environ["db_files_subdir"],
            ],
        )

        step.print("Copy the backend files.")
        backend_pod = combine.get_pod_id("backend")
        if not backend_pod:
            print("Cannot find the backend container.", file=sys.stderr)
            sys.exit(1)
        # if --clean option was used, delete the existing backend files
        if args.clean:
            # we run the rm command inside a bash shell so that the shell will do wildcard
            # expansion
            combine.exec(
                backend_pod,
                [
                    "/bin/bash",
                    "-c",
                    f"rm -rf /home/app/{os.environ['backend_files_subdir']}/*",
                ],
            )

        combine.kubectl(
            ["cp", os.environ["backend_files_subdir"], f"{backend_pod}:/home/app", "--no-preserve"]
        )


if __name__ == "__main__":
    main()
