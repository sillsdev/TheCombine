#!/usr/bin/env python3
"""
Set or increment the version number for The Combine.

This module will set or increment the version number for The Combine that is stored
in package.json depending on its arguments.  The version will follow the semantic
version definition defined at https://semver.org.

The Combine versions have the following form:
   Release version: major.minor.patch
   Pre-release version: major.minor.patch-[alpha|beta|rc].n
      where 'n' is a monotonic-increasing integer

The main goal of app_version.py is to be able to use GitHub Actions to help with
managing the software versions for The Combine.

The initial use will involve automatically setting the version on a push to a
development branch.  The version is set to a version incremented from the current
version on the master (main) branch.  It will also set the version to a release
version when a release is initiated through a GitHub Action.

Run "app_version.py --help" for a description of the script arguments.
"""
import argparse
import json
import logging
import os
from pathlib import Path
import sys

from semantic_version import Version

package_file = Path(__file__).resolve().parent.parent / "package.json"

prerelease_sequence = ["alpha", "beta", "rc"]


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    # Parse user command line arguments
    parser = argparse.ArgumentParser(
        description="Update the project version.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--incr",
        action="store_true",
        help="Increment the pre-release.  This is ignored if '--set' is specified.",
    )
    parser.add_argument(
        "--prerelease",
        action="store_true",
        help="Increment to the next pre-release type. This is ignored if '--set' is specified.",
    )
    parser.add_argument(
        "--release",
        choices=[
            "major",
            "minor",
            "patch",
        ],
        help="Make the current version a release version."
        "  This is ignored if '--set' is specified.",
    )
    parser.add_argument(
        "--get", action="store_true", help="Print the application version string on STDOUT"
    )
    parser.add_argument(
        "--set", help="Application version string. Must be a semantic version string."
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Logs progress and internal values on STDERR.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show changes that would be made without affecting any files.  Implies '--verbose'",
    )
    parser.add_argument(
        "--base-version",
        help="Starting app version to use instead of version in package.json."
        "  If the base version is less than the current version, the version"
        " will not be incremented.  This is ignored if '--set' is specified.",
    )
    return parser.parse_args()


def incr_prerelease_type(v: Version) -> Version:
    """Bump a version's prerelease type, to the next type in the sequence."""
    if len(v.prerelease) == 0:
        # This is a release version.  Next version is the first in
        # the pre-release series
        return Version(
            major=v.major,
            minor=v.minor,
            patch=v.patch + 1,
            prerelease=[prerelease_sequence[0], "0"],
        )
    # To find the next pre-release type in the series,
    # first validate what we have
    validate_prerelease(v)
    i = prerelease_sequence.index(v.prerelease[0]) + 1
    if i == len(prerelease_sequence):
        # We're at the end of the sequence so bump the pre-release number
        # instead
        return increment_prerelease(v)
    return Version(
        major=v.major, minor=v.minor, patch=v.patch, prerelease=[prerelease_sequence[i], "0"]
    )


def validate_prerelease(v: Version) -> None:
    """Validate that version prerelease section conforms to The Combine's usage."""
    if len(v.prerelease) > 0:
        error_message = ""
        # Verify that if the prerelease list exists it has 2 elements
        if len(v.prerelease) != 2:
            error_message = f"Unrecognized pre-release specification: {v.prerelease}"
        # and that the first element is 'alpha', 'beta', or 'rc'
        elif v.prerelease[0] not in prerelease_sequence:
            error_message = f"Unsupported pre-release type: {v.prerelease[0]}"
        # and that the second element is a number
        elif not v.prerelease[1].isnumeric():
            error_message = f"Pre-release number is not numeric: ({v.prerelease[1]})"
        if error_message:
            raise ValueError(error_message)


def increment_prerelease(v: Version) -> Version:
    validate_prerelease(v)
    if len(v.prerelease) == 2:
        new_prerelease = str(int(v.prerelease[1]) + 1)
        return Version(
            major=v.major,
            minor=v.minor,
            patch=v.patch,
            prerelease=[v.prerelease[0], new_prerelease],
        )
    elif len(v.prerelease) == 0:
        # If the version, v, is a release, return the first pre-release for the next release.
        return Version(
            major=v.major,
            minor=v.minor,
            patch=v.patch + 1,
            prerelease=[prerelease_sequence[0], "0"],
        )


def main() -> None:
    args = parse_args()

    if args.verbose or args.dry_run:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)
    else:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.WARNING)

    with open(package_file) as json_file:
        package = json.load(json_file)

    curr_version = Version(package["version"])
    if args.get:
        print(curr_version)
        sys.exit(0)
    if args.set is not None:
        next_version = Version(args.set)
        validate_prerelease(next_version)
    else:
        if args.base_version is not None:
            # A base version has been specified.  This is intended as a way to specify
            # the version on the master branch.  If the current version has already been
            # incremented past the master branch, no changes will be made.
            base_version = Version(args.base_version)
            if base_version < curr_version:
                logging.info(f"{base_version} < {curr_version}")
                logging.info("Nothing to do")
                sys.exit(0)
            else:
                curr_version = base_version

        logging.info(f"Current version: {curr_version}")
        if args.release is not None:
            if args.release == "major":
                next_version = Version(major=curr_version.major + 1, minor=0, patch=0)
            elif args.release == "minor":
                next_version = Version(
                    major=curr_version.major, minor=curr_version.minor + 1, patch=0
                )
            else:
                if len(curr_version.prerelease) > 0:
                    next_version = Version(
                        major=curr_version.major,
                        minor=curr_version.minor,
                        patch=curr_version.patch,
                    )
                else:
                    next_version = Version(
                        major=curr_version.major,
                        minor=curr_version.minor,
                        patch=curr_version.patch + 1,
                    )
        elif args.prerelease:
            next_version = incr_prerelease_type(curr_version)
        elif args.incr:
            next_version = increment_prerelease(curr_version)

    logging.info(f"New version: {next_version}")

    # Update the package.json file
    if not args.dry_run and next_version != curr_version:
        # Update package.json
        package["version"] = str(next_version)
        with open(package_file, "w") as json_file:
            json.dump(
                package,
                json_file,
                indent=2,
            )
            json_file.write("\n")
        os.chdir(str(package_file.parent))
        os.system("npm install")


if __name__ == "__main__":
    main()
