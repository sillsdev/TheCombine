#!/usr/bin/env python3

import argparse
import json
import logging
from pathlib import Path

from ruamel.yaml import YAML
from semantic_version import Version

package_file = Path(__file__).resolve().parent.parent / "package.json"

helm_dir = Path(__file__).resolve().parent.parent / "deploy" / "helm"

# Map the chart names to their location.  This is useful for updating
# dependencies as well as the charts.
helm_charts = {
    "cert-proxy-client": helm_dir / "cert-proxy-client" / "Chart.yaml",
    "cert-proxy-server": helm_dir / "cert-proxy-server" / "Chart.yaml",
    "create-admin-user": helm_dir / "create-admin-user" / "Chart.yaml",
    "thecombine": helm_dir / "thecombine" / "Chart.yaml",
    "backend": helm_dir / "thecombine" / "charts" / "backend" / "Chart.yaml",
    "database": helm_dir / "thecombine" / "charts" / "database" / "Chart.yaml",
    "frontend": helm_dir / "thecombine" / "charts" / "frontend" / "Chart.yaml",
    "maintenance": helm_dir / "thecombine" / "charts" / "maintenance" / "Chart.yaml",
}


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    # Parse user command line arguments
    parser = argparse.ArgumentParser(
        description="Update the project version. Prints the new app "
        "version on STDOUT if there is a change.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--incr",
        choices=["release", "major", "minor", "patch", "alpha", "beta", "rc"],
        help="Version level to be incremented. This is ignored if '--set' is specified.",
    )
    parser.add_argument(
        "--release",
        action="store_true",
        help="Make the current version a release version."
        "  This is ignored if '--set' is specified.",
    )
    parser.add_argument(
        "--set", help="Applicatio version string. Must be a semantic version string."
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


def increment_prerelease(v: Version, prerelease_type: str) -> Version:
    if len(v.prerelease) == 2:
        if v.prerelease[0] == prerelease_type and v.prerelease[1].isnumeric():
            new_prerelease = str(int(v.prerelease[1]) + 1)
            return Version(
                major=v.major,
                minor=v.minor,
                patch=v.patch,
                prerelease=[prerelease_type, new_prerelease],
            )
        if v.prerelease[1].isnumeric():
            return Version(
                major=v.major, minor=v.minor, patch=v.patch + 1, prerelease=[prerelease_type, "0"]
            )
    elif len(v.prerelease) == 0:
        return Version(
            major=v.major,
            minor=v.minor,
            patch=v.patch,
            prerelease=[prerelease_type, "0"],
        )
    except_message = f"Cannot increment {prerelease_type} version for {v}"
    raise ValueError(except_message)


def main() -> None:
    args = parse_args()
    if args.verbose or args.dry_run:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)
    else:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.WARNING)

    with open(package_file) as json_file:
        package = json.load(json_file)

    curr_version = Version(package["version"])
    if args.set is not None:
        next_version = Version(args.set)
    else:
        if args.base_version is not None:
            # A base version has been specified.  This is intended as a way to specify
            # the version on the master branch.  If the current version has already been
            # incremented past the master branch, no changes will be made.
            base_version = Version(args.base_version)
            if base_version < curr_version:
                logging.info(f"{base_version} < {curr_version}")
                logging.info("Nothing to do")
                exit(0)
            else:
                curr_version = base_version

        logging.info(f"Incrementing: {curr_version}")
        if args.release:
            next_version = Version(
                major=curr_version.major, minor=curr_version.minor, patch=curr_version.patch
            )
        if args.incr is not None:
            if args.incr == "major":
                next_version = Version(major=curr_version.major + 1, minor=0, patch=0)
            elif args.incr == "minor":
                next_version = Version(
                    major=curr_version.major, minor=curr_version.minor + 1, patch=0
                )
            elif args.incr == "patch":
                next_version = Version(
                    major=curr_version.major,
                    minor=curr_version.minor,
                    patch=curr_version.patch + 1,
                )
            else:
                # !!! This assumes that only pre-release increment requests have not been handled
                next_version = increment_prerelease(curr_version, args.incr)

    package["version"] = str(next_version)
    logging.info(f"New version: {next_version}")

    # Update the package.json file
    if not args.dry_run and next_version != curr_version:
        # Update package.json
        with open(package_file, "w") as json_file:
            json.dump(package, json_file, indent=2)
        # Update chart files
        yaml = YAML()
        yaml.indent(mapping=2, sequence=4, offset=2)
        for chart_name in helm_charts:
            chart_path = helm_charts[chart_name]
            with open(str(chart_path), "r") as chart_file:
                chart = yaml.load(chart_file)
            chart["version"] = str(next_version)
            chart["appVersion"] = str(next_version)
            if "dependencies" in chart:
                for dep_chart in chart["dependencies"]:
                    if dep_chart["name"] in helm_charts:
                        dep_chart["version"] = str(next_version)
            with open(str(chart_path), "w") as chart_file:
                yaml.dump(chart, chart_file)
        # Print the new version on standard out so that it can by used by calling
        # scripts
        print(str(next_version))


if __name__ == "__main__":
    main()
