#!/usr/bin/env python3

"""Build the Docker images for The Combine."""

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
    parser.add_argument("--repo", help="Push images to the specified Docker image repository.")
    parser.add_argument(
        "--compose", action="store_true", help="Generate images for docker compose."
    )
    return parser.parse_args()


def build_image(image_name: str, *, push_image: bool = False) -> None:
    """Build the specified Docker image."""
    os.system(f"docker build -t {image_name} -f Dockerfile .")
    if push_image:
        os.system(f"docker push {image_name}")


def main() -> None:
    """Build the Docker images for The Combine."""
    args = parse_args()

    build_specs = [
        {"dir": project_dir, "name": "frontend"},
        {"dir": project_dir / "Backend", "name": "backend"},
    ]

    if args.compose:
        build_specs.append({"dir": project_dir / "certmgr", "name": "certmgr"})
    else:
        build_specs.append({"dir": project_dir / "maintenance", "name": "maint"})

    for spec in build_specs:
        os.chdir(str(spec["dir"]))
        image_name = get_image_name(args.repo, str(spec["name"]), args.tag)
        os.system(f"docker build -t {image_name} -f Dockerfile .")
        if args.repo is not None:
            os.system(f"docker push {image_name}")


if __name__ == "__main__":
    main()
