#!/usr/bin/env python3

"""
Build the containerd images for The Combine.

This script currently supports using 'docker' or 'nerdctl' to build the container
images.  'nerdctl' is recommended when using Rancher Desktop for the development
environment and 'docker' is recommended when using Docker Desktop.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
import logging
import os
from pathlib import Path
from typing import Dict, Optional

from app_release import get_release, set_release
from utils import run_cmd


@dataclass(frozen=True)
class BuildSpec:
    dir: Path
    name: str


project_dir = Path(__file__).resolve().parent.parent.parent
"""Absolute path to the checked out repository."""


def get_image_name(repo: Optional[str], component: str, tag: Optional[str]) -> str:
    """Build the image name from the repo, the component, and the image tag."""
    tag_str = ""
    if tag is not None and len(tag):
        tag_str = f":{tag}"
    if repo is not None and len(repo):
        return f"{repo}/combine_{component}{tag_str}"
    return f"combine_{component}{tag_str}"


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Build containerd container images for project.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--components",
        nargs="*",
        choices=["frontend", "backend", "maintenance"],
        help="Combine components to build.",
    )
    parser.add_argument(
        "--tag",
        "-t",
        help="Image tag",
    )
    parser.add_argument(
        "--repo", "-r", help="Push images to the specified Docker image repository."
    )
    parser.add_argument(
        "--nerdctl",
        action="store_true",
        help="Use 'nerdctl' instead of 'docker' to build images.",
    )
    parser.add_argument(
        "--namespace",
        "-n",
        help="Namespace for 'nerdctl' when building images.",
        default="k8s.io",
    )
    parser.add_argument(
        "--output-level",
        "-o",
        choices=["none", "progress", "all"],
        help="Specify the amount of output desired during the build.",
    )
    return parser.parse_args()


def main() -> None:
    """Build the Docker images for The Combine."""
    args = parse_args()

    if args.output_level != "none":
        log_level = logging.INFO
    else:
        log_level = logging.WARNING
    logging.basicConfig(format="%(levelname)s:%(message)s", level=log_level)

    if args.nerdctl:
        build_cmd = f"nerdctl -n {args.namespace}"
    else:
        build_cmd = "docker"

    if args.components is not None:
        to_do = args.components
    else:
        to_do = ["backend", "frontend", "maintenance"]

    build_specs: Dict[str, BuildSpec] = {
        "backend": BuildSpec(project_dir / "Backend", "backend"),
        "maintenance": BuildSpec(project_dir / "maintenance", "maint"),
        "frontend": BuildSpec(project_dir, "frontend"),
    }

    # Create the version file
    release_file = project_dir / "public" / "scripts" / "release.js"

    set_release(get_release(), release_file)

    # Build each of the component images
    for component in to_do:
        spec = build_specs[component]
        os.chdir(spec.dir)
        image_name = get_image_name(args.repo, spec.name, args.tag)
        logging.info(f"Building component {component}")
        print_all = args.output_level == "all"
        run_cmd(
            [build_cmd, "build", "-t", image_name, "-f", "Dockerfile", "."],
            print_cmd=print_all,
            print_output=print_all,
        )
        logging.info(f"{component} build complete")
        if args.repo is not None:
            run_cmd([build_cmd, "push", image_name])
            logging.info(f"{image_name} pushed to {args.repo}")

    # Remove the version file
    if release_file.exists():
        release_file.unlink()


if __name__ == "__main__":
    main()
