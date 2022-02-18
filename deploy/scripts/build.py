#!/usr/bin/env python3

"""
Build the containerd images for The Combine.

This script currently supports using 'docker' or 'nerdctl' to build the container
images.  'nerdctl' is recommended when using Rancher Desktop for the development
environment and 'docker' is recommended when using Docker Desktop.
"""

import argparse
from dataclasses import dataclass
import os
from pathlib import Path
from typing import List, Optional


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
    return parser.parse_args()


def main() -> None:
    """Build the Docker images for The Combine."""
    args = parse_args()

    if args.nerdctl:
        build_cmd = f"nerdctl -n {args.namespace}"
    else:
        build_cmd = "docker"

    build_specs: List[BuildSpec] = [
        BuildSpec(project_dir, "frontend"),
        BuildSpec(project_dir / "Backend", "backend"),
        BuildSpec(project_dir / "maintenance", "maint"),
    ]

    for spec in build_specs:
        os.chdir(spec.dir)
        image_name = get_image_name(args.repo, spec.name, args.tag)
        os.system(f"{build_cmd} build -t {image_name} -f Dockerfile .")
        if args.repo is not None:
            os.system(f"{build_cmd} push {image_name}")


if __name__ == "__main__":
    main()
