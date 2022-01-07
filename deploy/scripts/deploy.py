#!/usr/bin/env python3

"""Build the Docker and update deployments for The Combine."""

import argparse
import os
from pathlib import Path

from development_config import get_image_name

project_dir = Path(__file__).resolve().parent.parent
"""Absolute path to the checked out repository."""


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Build Docker container images for project.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--tag",
        help="Image tag",
    )
    parser.add_argument(
        "--run",
        choices=["all", "build", "deploy"],
        default="all",
        help="Specify which tasks to perform: build, deploy, or all",
    )
    parser.add_argument(
        "--repo",
        default="localhost:5050",
        help="Push images to the specified Docker image repository.",
    )
    parser.add_argument("--target", help="Name of the target machine for the deploy action.")
    return parser.parse_args()


def run_cmd(cmd: List[str], *, check_results: bool = True) -> subprocess.CompletedProcess[str]:
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
    """Build the Docker images for The Combine."""
    args = parse_args()

    deploy_specs = [
        {"dir": project_dir, "name": "frontend", "component": "frontend"},
        {"dir": project_dir / "Backend", "name": "backend", "component": "backend"},
        {"dir": project_dir / "maintenance", "name": "maintenance", "component": "maint"},
    ]

    if args.run == "all" or args.run == "build":
        for spec in deploy_specs:
            os.chdir(str(spec["dir"]))
            image = get_image_name(args.repo, str(spec["component"]), args.tag)
            run_cmd(["docker", "build", "-t", image, "-f", "Dockerfile", "."])
            run_cmd(["docker", "push", "image"])

    if args.run == "all" or args.run == "deploy":
        print("Deploying The Combine")


if __name__ == "__main__":
    main()
