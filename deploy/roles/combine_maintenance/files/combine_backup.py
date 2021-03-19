#!/usr/bin/env python3
"""Create a backup of TheCombine and push the file to AWS S3 service."""

import argparse
from datetime import datetime
import json
import os
from pathlib import Path
import sys
import tarfile
from typing import Dict

from maint_utils import rm_backup_files, run_cmd
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
    default_config = Path(__file__).resolve().parent / "backup_conf.json"
    parser.add_argument("--config", help="backup configuration file.", default=default_config)
    return parser.parse_args()


def main() -> None:
    """Create a backup of TheCombine database and backend files."""
    args = parse_args()

    config: Dict[str, str] = json.loads(args.config.read_text())

    step = ScriptStep()

    date_str = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    backup_dir = Path(config["backup_dir"])
    backup_file = "combine-backup.tar.gz"
    aws_file = f"{config['aws_bucket']}/{config['combine_host']}-{date_str}.tar.gz"
    # turn off the color coding for docker-compose output - adds unreadable escape
    # characters to syslog
    compose_opts = "--no-ansi"

    try:
        # Change the current working Directory
        os.chdir(f"{config['combine_app_dir']}")
    except OSError:
        print(f"Cannot change directory to {config['combine_app_dir']}")
        sys.exit(1)

    # save current directory to return to it later
    workdir = Path.cwd()

    step.print("Prepare the backup directory.", args.verbose)
    if not backup_dir.exists():
        backup_dir.mkdir(0o755, parents=True, exist_ok=True)
    else:
        rm_backup_files(
            [
                backup_dir / config["db_files_subdir"],
                backup_dir / config["backend_files_subdir"],
                backup_dir / backup_file,
            ]
        )

    step.print("Stop the frontend and certmgr containers.", args.verbose)
    run_cmd(
        [
            "docker-compose",
            compose_opts,
            "stop",
            "--timeout",
            "0",
            "frontend",
            "certmgr",
        ]
    )

    step.print("Dump the database.", args.verbose)
    run_cmd(
        [
            "docker-compose",
            compose_opts,
            "exec",
            "-T",
            "database",
            "/usr/bin/mongodump",
            "--db=CombineDatabase",
            "--gzip",
            config["quiet_opt"],
        ]
    )

    check_backup_results = run_cmd(
        [
            "docker-compose",
            "exec",
            "-T",
            "database",
            "ls",
            config["db_files_subdir"],
        ],
        check_results=False,
    )
    if check_backup_results.returncode != 0:
        print("No database backup file - most likely empty database.", file=sys.stderr)
        sys.exit(0)

    db_container = run_cmd(
        ["docker", "ps", "--filter", "name=database", "--format", "{{.Names}}"]
    ).stdout.strip()
    run_cmd(
        [
            "docker",
            "cp",
            f"{db_container}:{config['db_files_subdir']}/",
            str(backup_dir),
        ]
    )

    step.print(
        "Copy the backend files (commands are run relative the 'app' user's home directory).",
        args.verbose,
    )
    backend_container = run_cmd(
        ["docker", "ps", "--filter", "name=backend", "--format", "{{.Names}}"]
    ).stdout.strip()
    run_cmd(
        [
            "docker",
            "cp",
            f"{backend_container}:/home/app/{config['backend_files_subdir']}/",
            str(backup_dir),
        ]
    )

    step.print("Create the tarball for the backup.", args.verbose)
    os.chdir(backup_dir)

    with tarfile.open(backup_file, "x:gz") as tar:
        for name in (config["backend_files_subdir"], config["db_files_subdir"]):
            tar.add(name)

    step.print("Push backup to AWS S3 storage.", args.verbose)
    #    need to specify full path because $PATH does not contain
    #    /usr/local/bin when run as a cron job
    run_cmd(
        [
            "aws",
            config["quiet_opt"],
            "s3",
            "cp",
            backup_file,
            aws_file,
            "--profile",
            config["aws_s3_profile"],
        ]
    )

    step.print("Remove backup files.", args.verbose)
    # Running in backup_dir
    rm_backup_files(
        [Path(config["db_files_subdir"]), Path(config["backend_files_subdir"]), Path(backup_file)]
    )

    step.print("Restart the frontend and certmgr containers.", args.verbose)
    os.chdir(workdir)
    run_cmd(["docker-compose", compose_opts, "start", "certmgr", "frontend"])


if __name__ == "__main__":
    main()
