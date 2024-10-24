#!/usr/bin/env python3
"""Create a backup of TheCombine and push the file to AWS S3 service."""

import argparse
from datetime import datetime
import logging
import os
from pathlib import Path
import sys
import tarfile
import tempfile

from aws_backup import AwsBackup
from combine_app import CombineApp
from maint_utils import check_env_vars, wait_for_dependents
from script_step import ScriptStep


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    parser = argparse.ArgumentParser(
        description="Backup TheCombine database and backend files and push to AWS S3 bucket.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--verbose", action="store_true", help="Print intermediate values to aid in debugging"
    )
    return parser.parse_args()


def main() -> None:
    """Create a backup of TheCombine database and backend files."""
    args = parse_args()
    if args.verbose:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)
    else:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.WARNING)
    combine = CombineApp()
    aws_bucket, combine_host, db_files_subdir, backend_files_subdir = check_env_vars(
        ["aws_bucket", "combine_host", "db_files_subdir", "backend_files_subdir"]
    )
    aws = AwsBackup(bucket=aws_bucket)
    step = ScriptStep()

    step.print("Make sure backend and database are available")
    wait_time = int(os.getenv("wait_time", 60))
    if not wait_for_dependents(
        [CombineApp.Component.Database.value, CombineApp.Component.Backend.value],
        timeout=wait_time,
    ):
        print("Database or Backend are not available")
        sys.exit(1)

    step.print("Prepare the backup directory.")
    with tempfile.TemporaryDirectory() as backup_dir:
        backup_file = Path("combine-backup.tar.gz")
        date_str = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
        aws_file = f"{combine_host}-{date_str}.tar.gz"

        step.print("Dump the database.")
        db_pod = combine.get_pod_id(CombineApp.Component.Database)
        if not db_pod:
            print("Cannot find the database container.", file=sys.stderr)
            sys.exit(1)
        combine.exec(
            db_pod,
            [
                "/usr/bin/mongodump",
                "--db=CombineDatabase",
                "--gzip",
            ],
        )

        check_backup_results = combine.exec(
            db_pod,
            [
                "ls",
                db_files_subdir,
            ],
            check_results=False,
        )
        if check_backup_results.returncode != 0:
            print("No database backup file - most likely empty database.", file=sys.stderr)
            sys.exit(0)
        combine.kubectl(
            [
                "cp",
                f"{db_pod}:/{db_files_subdir}",
                str(Path(backup_dir) / db_files_subdir),
            ]
        )

        step.print("Copy the backend files.")
        backend_pod = combine.get_pod_id(CombineApp.Component.Backend)
        if not backend_pod:
            print("Cannot find the backend container.", file=sys.stderr)
            sys.exit(1)
        combine.kubectl(
            [
                "cp",
                f"{backend_pod}:/home/app/{backend_files_subdir}/",
                str(Path(backup_dir) / backend_files_subdir),
            ]
        )

        step.print("Create the tarball for the backup.")
        # cd to backup_dir so that files in the tarball are relative to the backup_dir
        os.chdir(backup_dir)

        with tarfile.open(backup_file, "x:gz") as tar:
            for name in (backend_files_subdir, db_files_subdir):
                tar.add(name)

        step.print("Push backup to AWS S3 storage.")
        aws.push(backup_file, aws_file)


if __name__ == "__main__":
    main()
