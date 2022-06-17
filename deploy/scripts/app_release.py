#!/usr/bin/env python3

from __future__ import annotations

import argparse
import os
from pathlib import Path
import re

from utils import run_cmd

project_dir = Path(__file__).resolve().parent.parent.parent


def get_release() -> str:
    os.chdir(project_dir)
    result = run_cmd(["git", "describe", "--tags", "HEAD"], chomp=True)
    # Check to see if this is a release version.
    match = re.search(r"^v?(\d+\.\d+\.\d+)(-\S+\.\d+)?$", result.stdout)
    if match:
        return match.expand(r"v\1\2")
    else:
        # Find the number of commits since tag/branch
        match = re.search(r"^v?(\d+\.\d+\.\d+)(-\S+\.\d+)?-(\d+)-g[0-9a-f]+$", result.stdout)
        if match and match.lastindex is not None:
            if match.lastindex > 2:
                release_string = match.expand(r"v\1\2")
                num_commits = match[3]
            else:
                release_string = match.expand(r"v\1")
                num_commits = match[2]
            # Get the branch name
            result = run_cmd(["git", "branch", "--show-current"], chomp=True)
            branch_name = re.sub("_+", "-", result.stdout)
            return f"{release_string}-{branch_name}.{num_commits}"
    message = f"Unrecognized release value in tag: {result.stdout}"
    raise ValueError(message)


def set_release(release_id: str, dest_file: Path) -> None:
    """Create a release.js file to hold the release name of The Combine."""
    if not dest_file.parent.exists():
        dest_file.parent.mkdir()
    dest_file.write_text(f'window["release"] = "{release_id}";\n')


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    # Parse user command line arguments
    parser = argparse.ArgumentParser(
        description="Command line interface for get/set release commands.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--get",
        action="store_true",
        help="Print the release (from git) on stdout.",
    )
    parser.add_argument("--set", help="Release string to be stored in the release file.")
    parser.add_argument(
        "--set-current", action="store_true", help="Set the release to the value returned by --get"
    )
    parser.add_argument(
        "--path",
        default=str(project_dir / "public" / "scripts" / "release.js"),
        help="Location of the release output file",
    )
    return parser.parse_args()


if __name__ == "__main__":
    """
    Allow calling from the command line.

    Allow calling from the command line so that node scripts can get/set the release.
    """
    args = parse_args()
    if args.get:
        print(get_release())
    elif args.set_current:
        set_release(get_release(), Path(args.path))
    elif args.set is not None:
        set_release(args.set, Path(args.path))
