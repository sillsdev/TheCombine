#!/usr/bin/env python3
"""Restore TheCombine from a backup stored in the AWS S3 service."""

import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tarfile
from typing import Dict, List

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
        "--clean", action="store_true", help="Cleanout Backend files before restoring from backup"
    )
    default_config = Path(os.path.dirname(sys.argv[0])) / "backup_conf.json"
    parser.add_argument("--config", help="backup configuration file.", default=default_config)
    parser.add_argument("--file", help="name of file in AWS S3 to be restored.")
    return parser.parse_args()


def rm_backup_files(path_list: List[Path]) -> None:
    """Clean out the directory used to build the backup tarball."""
    for item in path_list:
        if item.exists():
            if item.is_dir():
                shutil.rmtree(item)
            else:
                item.unlink()


def run_cmd(cmd: List[str], check_results: bool = True) -> subprocess.CompletedProcess:
    """Run a command with subprocess and catch any CalledProcessErrors."""
    try:
        return subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            check=check_results,
        )
    except subprocess.CalledProcessError as err:
        print(f"CalledProcessError returned {err.returncode}")
        print(f"stdout: {err.stdout}")
        print(f"stderr: {err.stderr}")
        sys.exit(err.returncode)


def aws_strip_bucket(obj_name: str) -> str:
    """Strip the bucket name from the beginning of the supplied object name."""
    m = re.match(r"^[^/]+/(.*)", obj_name)
    if m is not None:
        return m.group(1)
    else:
        return obj_name


def main() -> None:
    """Restore TheCombine from a backup stored in the AWS S3 service."""
    args = parse_args()

    config: Dict[str, str] = json.load(open(args.config))
    step = ScriptStep()

    step.print(args.verbose, "Prepare for the restore.")

    restore_file = "combine-backup.tar.gz"
    restore_dir = Path(config["restore_dir"])

    try:
        # Change the current working Directory
        os.chdir(f"{config['combine_app_dir']}")
    except OSError:
        print(f"Cannot change directory to {config['combine_app_dir']}")
        sys.exit(1)

    # save current directory to return to it later
    workdir = Path.cwd()

    if not restore_dir.exists():
        restore_dir.mkdir(0o755, True, True)
    else:
        rm_backup_files(
            [
                restore_dir / config["db_files_subdir"],
                restore_dir / config["backend_files_subdir"],
                restore_dir / restore_file,
            ]
        )

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
            .split("\n")[1::]
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

    step.print(args.verbose, f"Fetch the selected backup, {backup}.")
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

    step.print(args.verbose, "Stop the frontend and certmgr containers.")
    run_cmd(
        [
            "docker-compose",
            "stop",
            "--timeout",
            "0",
            "frontend",
            "certmgr",
        ]
    )

    step.print(args.verbose, "Unpack the backup.")
    os.chdir(restore_dir)
    tar = tarfile.open(restore_file, "r:gz")
    tar.extractall()
    tar.close()

    step.print(args.verbose, "Restore the database.")
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
            "exec",
            "-T",
            "database",
            "rm",
            "-rf",
            config["db_files_subdir"],
        ]
    )

    step.print(args.verbose, "Copy the backend files.")
    # if --clean option was used, delete the existing backend files
    if args.clean:
        # we run the rm command inside a bash shell so that the shell will do wildcard
        # expansion
        run_cmd(
            [
                "docker-compose",
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

    be_container = run_cmd(
        [
            "docker",
            "ps",
            "--filter",
            "name=backend",
            "--format",
            "{{.Names}}",
        ]
    ).stdout.strip()

    run_cmd(["docker", "cp", config["backend_files_subdir"], f"{be_container}:/home/app"])
    # change permissions for the copied files.  Since the tarball is created outside
    # of the container, the app user will not be the owner (the backend process is
    # running as "app").  In addition, it is possible that the backup is from a
    # different host with different UIDs.
    run_cmd(
        [
            "docker-compose",
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

    step.print(args.verbose, "Cleanup Restore files.")
    os.chdir(workdir)
    shutil.rmtree(restore_dir)

    step.print(args.verbose, "Restart the containers.")
    run_cmd(["docker-compose", "start", "certmgr", "frontend"])


if __name__ == "__main__":
    main()
