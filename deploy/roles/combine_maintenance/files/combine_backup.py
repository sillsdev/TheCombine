#!/usr/bin/env python3
"""Create a backup of TheCombine and push the file to AWS S3 service."""

import argparse
from datetime import datetime
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
from typing import Dict, List

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
    default_config = Path(os.path.dirname(sys.argv[0])) / "backup_conf.json"
    parser.add_argument("--config", help="backup configuration file.", default=default_config)
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


def main() -> None:
    """Create a backup of TheCombine database and backend files."""
    args = parse_args()

    config: Dict[str, str] = json.load(open(args.config))
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

    step.print(args.verbose, "Prepare the backup directory.")
    if not backup_dir.exists():
        backup_dir.mkdir(0o755, True, True)
    else:
        rm_backup_files(
            [
                backup_dir / config["db_files_subdir"],
                backup_dir / config["backend_files_subdir"],
                backup_dir / backup_file,
            ]
        )

    step.print(args.verbose, "Stop the frontend and certmgr containers.")
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

    step.print(args.verbose, "Dump the database.")
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
        False,
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
        args.verbose,
        "Copy the backend files (commands are run relative the 'app' user's home directory).",
    )
    be_container = run_cmd(
        ["docker", "ps", "--filter", "name=backend", "--format", "{{.Names}}"]
    ).stdout.strip()
    run_cmd(
        [
            "docker",
            "cp",
            f"{be_container}:/home/app/{config['backend_files_subdir']}/",
            str(backup_dir),
        ]
    )

    step.print(args.verbose, "Create the tarball for the backup.")
    os.chdir(backup_dir)

    tar = tarfile.open(backup_file, "x:gz")
    for name in [config["backend_files_subdir"], config["db_files_subdir"]]:
        tar.add(name)
    tar.close()

    step.print(args.verbose, "Push backup to AWS S3 storage.")
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

    step.print(args.verbose, "Remove backup files.")
    # Running in backup_dir
    rm_backup_files(
        [Path(config["db_files_subdir"]), Path(config["backend_files_subdir"]), Path(backup_file)]
    )

    step.print(args.verbose, "Restart the frontend and certmgr containers.")
    os.chdir(workdir)
    run_cmd(["docker-compose", compose_opts, "start", "certmgr", "frontend"])


if __name__ == "__main__":
    main()
