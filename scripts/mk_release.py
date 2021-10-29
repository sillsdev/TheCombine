#! /usr/bin/env python3
"""
List commits since the latest or since a specified release.

Creates a list of all the releases since a specific release.  The release may be
specified on the command line or the latest release will be used.

This script makes the following assumptions:
 - The releases are tagged with the release number only, e.g. '0.7.8',
   not 'v0.7.8'.
 - The release numbers are of the form: major.minor.patch levels.
 - The release numbers are monotonic increasing.
"""

import argparse
from dataclasses import dataclass
import re
import subprocess
import sys
from typing import Dict, List


@dataclass
class SemVersion:
    major: int = -1
    minor: int = -1
    patch: int = -1

    def to_tag(self) -> str:
        return f"{self.major}.{self.minor}.{self.patch}"


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="List commits since a specified release.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--since-release",
        help="Release to use instead of the latest one.",
        default="latest",
    )
    return parser.parse_args()


def latest_release(release_list: List[str]) -> SemVersion:
    """Find the latest release for the current repository."""
    latest = SemVersion()
    current = SemVersion()
    rls_pattern = re.compile(r"(\d+)\.(\d+)\.(\d+)")
    for release in release_list:
        match = rls_pattern.match(release)
        if match is not None:
            current.major = int(match.group(1))
            current.minor = int(match.group(2))
            current.patch = int(match.group(3))

            if current.major > latest.major:
                latest = current
            elif current.major == latest.major:
                if current.minor > latest.minor:
                    latest = current
                elif current.minor == latest.minor and current.patch > latest.patch:
                    latest = current
    return latest


def build_release_list() -> Dict[str, str]:
    """
    Create a list of all the releases.

    Returns a Dict where the key is the release tag and the value is the commit for the release.
    """
    release_list: Dict[str, str] = {}
    try:
        list_results = subprocess.run(
            ["git", "show-ref", "--tags", "-d"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            check=True,
            text=True,
        )
    except subprocess.CalledProcessError as err:
        print(f"CalledProcessError returned {err.returncode}")
        print(f"stdout: {err.stdout}")
        print(f"stderr: {err.stderr}")
        sys.exit(err.returncode)
    else:
        rls_pattern = re.compile(r"([0-9a-f]{40}) refs/tags/(\d+\.\d+\.\d+)$")
        for line in list_results.stdout.splitlines():
            match = rls_pattern.match(line)
            if match is not None:
                commit = match.group(1)
                tag = match.group(2)
                if tag in release_list:
                    print(f"Duplicate tag: {tag}", file=sys.stderr)
                else:
                    release_list[tag] = commit
    return release_list


def list_commits(end_commit: str) -> None:
    """
    List all commits from the end of the log until the end_commit.

    This function runs 'git log' on the current branch and then looks
    for a line that starts with 'commit' followed by a 40-character
    hexadecimal string.  If that string matches the 'end_commit' then
    the list is complete and the function returns.

    If not, then it searches for the first non-blank line that begins
    with one or more spaces.  This line is printed as the commit title
    and then repeats the process searching for the next commit.
    """
    try:
        log_results = subprocess.run(
            ["git", "log", "--no-color"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            check=True,
            text=True,
            encoding="utf-8",
        )
    except subprocess.CalledProcessError as err:
        print(f"CalledProcessError returned {err.returncode}")
        print(f"stdout: {err.stdout}")
        print(f"stderr: {err.stderr}")
        sys.exit(err.returncode)
    else:
        # Initialize search state: we are not at the start of a commit
        start_of_commit = False
        # Setup the Regular Expressions for parsing the log output
        commit_pattern = re.compile(r"^commit ([0-9a-f]{40})")
        pr_pattern = re.compile(r"^ +([^ ].*)")
        for line in log_results.stdout.splitlines():
            if not start_of_commit:
                # We have not found the next commit yet; see if this line
                # starts the log of a commit
                commit_match = commit_pattern.match(line)
                if commit_match is not None:
                    start_of_commit = True
                    # Check to see if we're done
                    this_commit = commit_match.group(1)
                    if this_commit == end_commit:
                        break
            else:
                # We are searching for the commit title now
                pr_match = pr_pattern.match(line)
                if pr_match is not None:
                    print(f" - {pr_match.group(1)}")
                    start_of_commit = False


def main() -> None:
    """List commits since the latest or a specified release."""
    args = parse_args()
    releases = build_release_list()
    if args.since_release == "latest":
        tag = latest_release(list(releases.keys())).to_tag()
        print(tag)
    else:
        tag = args.since_release
    if not re.match(r"^\d+\.\d+\.\d+$", tag):
        print(f"Invalid tag, {tag}.", file=sys.stderr)
        sys.exit(1)
    if tag not in releases:
        print(f"Cannot find release {tag}", file=sys.stderr)
        sys.exit(1)
    release_commit = releases[tag]
    # Now print all commits since the specified release
    list_commits(release_commit)


if __name__ == "__main__":
    main()
