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


def build_image(image_name: str, *, build_arg: str = "", push_image: bool = False) -> None:
    """Build the specified Docker image."""
    arg_string = " "
    if len(build_arg):
        arg_string += f"--build-arg {build_arg} "
    os.system(f"docker build{arg_string}-t {image_name} -f Dockerfile .")
    if push_image:
        os.system(f"docker push {image_name}")


def main() -> None:
    """Build the Docker images for The Combine."""
    args = parse_args()

    # Build the frontend
    os.chdir(project_dir)
    if not args.compose:
        template_arg = "NGINX_CONF_TEMPLATE=templates_kube"
    else:
        template_arg = ""
    build_image(
        get_image_name(args.repo, "frontend", args.tag),
        build_arg=template_arg,
        push_image=(args.repo is not None),
    )

    # Build the backend
    os.chdir(project_dir / "Backend")
    build_image(
        get_image_name(args.repo, "backend", args.tag),
        push_image=(args.repo is not None),
    )

    # Build the certmgr (if building for Docker Compose)
    if args.compose:
        os.chdir(project_dir / "certmgr")
        build_image(
            get_image_name(args.repo, "certmgr", args.tag),
            push_image=(args.repo is not None),
        )


if __name__ == "__main__":
    main()
