#! /usr/bin/env python3

import argparse
from pathlib import Path
import tempfile
import yaml

project_dir = Path(__file__).resolve().parent.parent
"""Absolute path to the checked out repository."""


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate Helm Charts for The Combine.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--target",
        help="Target system where The Combine is to be installed.",
    )
    parser.add_argument(
        "--config",
        help="Configuration file for the target(s).",
        default=str(project_dir / "k8s_config" / "target_config.yaml"),
    )
    parser.add_argument(
        "-f",
        nargs="*",
        help="Specificy additional Helm configuration file to override default values.  See `helm install --help`",
    )
    parser.add_argument(
        "--set",
        nargs="*",
        help="Specificy additional Helm configuration variable to override default values.  See `helm install --help`",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    with tempfile.NamedTemporaryFile() as secrets_file:
        secrets_file.write(bytearray("Save this.\n", "utf8"))
        print(secrets_file.name())
    project_dir = Path(__file__).resolve().parent.parent
    deploy_dir = project_dir / "deploy"
    with open(deploy_dir / "vars" / "packages.yml", "r") as file:
        package_cfg = yaml.safe_load(file)
        print(package_cfg)


if __name__ == "__main__":
    main()
