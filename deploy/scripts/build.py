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
from pathlib import Path
import subprocess
from typing import Dict, List, Optional

from app_release import get_release, set_release

@dataclass(frozen=True)
class BuildSpec:
    dir: Path
    name: str

"""
Simplify this:
1. Job only has cmd, cwd, success, error
   (still clunky - success & error are needed after job has been popped off the queue so they need
    to be copied to the running jobs)
2. create job_queue: Dict[str, List[Job]]
3. create running_jobs which is a map of Popen results
"""
class Job:
    def __init__(
        self, cmd: List[str], cwd: Optional[Path]
    ) -> None:
        self.cmd = cmd
        self.cwd = cwd

    def run(self) -> None:
        self.process = subprocess.Popen(self.cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=self.cwd)


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
        build_prog = ["nerdctl", "-n", args.namespace]
    else:
        build_prog = ["docker"]

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

    # Start build of each of the components
    build_jobs: List[Job] = []
    for component in to_do:
        spec = build_specs[component]
        image_name = get_image_name(args.repo, spec.name, args.tag)
        build_cmd = [build_prog, "build", "-t", image_name, "-f", "Dockerfile", "."]
        push_cmd = [build_prog, "push", image_name]
        logging.info(f"Building component {component}")
        job = Job(component, image_name, build_cmd, push_cmd, spec.dir)
        build_jobs.append(job)
        job.build()

    # Wait for the build jobs to complete; start push of built images if
    # repo is specified
    for job in build_jobs:
        if hasattr(job, "build_process"):
            results = job.build_process.wait()
            if results == 0:
               logging.info(f"{component} build complete")
            else:
                logging.error(f"*** {component} build failed. ***")
            job.push()

    # wait for the push jobs to complete
    for job in build_jobs:
        if hasattr(job, "push_process"):
            job.push_process.wait()
            logging.info(f"{job.image_name} pushed to {args.repo}")

    # Remove the version file
    if release_file.exists():
        release_file.unlink()


if __name__ == "__main__":
    main()
