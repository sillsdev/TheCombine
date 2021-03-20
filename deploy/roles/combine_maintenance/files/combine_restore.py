#!/usr/bin/env python3
"""Restore TheCombine from a backup stored in the AWS S3 service."""

import argparse
import json
import os
from pathlib import Path
import re
import sys
import tarfile
import tempfile
from typing import Dict

from maint_utils import run_cmd
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
    default_config = Path(__file__).resolve().parent / "backup_conf.json"
    parser.add_argument("--config", help="backup configuration file.", default=default_config)
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
    workdir = Path.cwd()
    args = parse_args()
    config: Dict[str, str] = json.loads(args.config.read_text())

    step = ScriptStep()
    step.print("Prepare for the restore.", args.verbose)
    with tempfile.TemporaryDirectory() as restore_dir:
        restore_file = "combine-backup.tar.gz"
        compose_file = Path(config["combine_app_dir"]) / "docker-compose.yml"

        if not args.file:
            # Get the list of backups but throw away the header
            aws_backup_list = (
                run_cmd(
                    [
                        "aws",
                        "s3",
                        "ls",
                        config["aws_bucket"],
                        "--recursive",
                        "--profile",
                        config["aws_s3_profile"],
                    ]
                )
                .stdout.strip()
                .split("\n")[1:]
            )
            if len(aws_backup_list) == 0:
                print(f"No backups available from {config['aws_bucket']}")
                sys.exit(0)

            # Print out the list of backups to choose from.  In the process,
            # update each line in the backup list to just be the AWS S3 object name.
            print("Backup List:")
            for i, item in enumerate(aws_backup_list):
                aws_backup_list[i] = aws_strip_bucket(item.split()[3])
                print(f"{i+1}: {aws_backup_list[i]}")
            backup_num = int(
                input("Enter the number of the backup you would like to restore (0 = None):")
            )
            if backup_num == 0:
                print("No backup selected.  Exiting.")
                sys.exit(0)
            backup = aws_backup_list[backup_num - 1]
        else:
            backup = args.file

        step.print(f"Fetch the selected backup, {backup}.", args.verbose)
        aws_file = f"{config['aws_bucket']}/{backup}"

        run_cmd(
            [
                "aws",
                "s3",
                "cp",
                aws_file,
                str(restore_dir / restore_file),
                "--profile",
                config["aws_s3_profile"],
            ]
        )

        step.print("Stop the frontend and certmgr containers.", args.verbose)
        run_cmd(
            [
                "docker-compose",
                "-f",
                str(compose_file),
                "stop",
                "--timeout",
                "0",
                "frontend",
                "certmgr",
            ]
        )

        step.print("Unpack the backup.", args.verbose)
        os.chdir(restore_dir)
        with tarfile.open(restore_file, "r:gz") as tar:
            tar.extractall()

        step.print("Restore the database.", args.verbose)
        db_container = run_cmd(
            ["docker", "ps", "--filter", "name=database", "--format", "{{.Names}}"]
        ).stdout.strip()
        run_cmd(
            [
                "docker",
                "cp",
                config["db_files_subdir"],
                f"{db_container}:/",
            ]
        )

        run_cmd(
            [
                "docker-compose",
                "-f",
                str(compose_file),
                "exec",
                "-T",
                "database",
                "mongorestore",
                "--drop",
                "--gzip",
                "--quiet",
            ]
        )
        run_cmd(
            [
                "docker-compose",
                "-f",
                str(compose_file),
                "exec",
                "-T",
                "database",
                "rm",
                "-rf",
                config["db_files_subdir"],
            ]
        )

        step.print("Copy the backend files.", args.verbose)
        # if --clean option was used, delete the existing backend files
        if args.clean:
            # we run the rm command inside a bash shell so that the shell will do wildcard
            # expansion
            run_cmd(
                [
                    "docker-compose",
                    "-f",
                    str(compose_file),
                    "exec",
                    "-T",
                    "--user",
                    "root",
                    "--workdir",
                    f"/home/app/{config['backend_files_subdir']}",
                    "backend",
                    "/bin/bash",
                    "-c",
                    "rm -rf *",
                ]
            )

        backend_container = run_cmd(
            [
                "docker",
                "ps",
                "--filter",
                "name=backend",
                "--format",
                "{{.Names}}",
            ]
        ).stdout.strip()

        run_cmd(["docker", "cp", config["backend_files_subdir"], f"{backend_container}:/home/app"])
        # change permissions for the copied files.  Since the tarball is created outside
        # of the container, the app user will not be the owner (the backend process is
        # running as "app").  In addition, it is possible that the backup is from a
        # different host with different UIDs.
        run_cmd(
            [
                "docker-compose",
                "-f",
                str(compose_file),
                "exec",
                "-T",
                "--user",
                "root",
                "backend",
                "find",
                f"/home/app/{config['backend_files_subdir']}",
                "-exec",
                "chown",
                "app:app",
                "{}",
                ";",
            ]
        )

        step.print("Cleanup Restore files.", args.verbose)
        os.chdir(workdir)

    step.print("Restart the containers.", args.verbose)
    run_cmd(["docker-compose", "-f", str(compose_file), "start", "certmgr", "frontend"])


if __name__ == "__main__":
    main()
