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
import sys
import time
from typing import Callable, Dict, List, Optional

from app_release import get_release, set_release
from enum_types import JobStatus
from sem_dom_import import generate_semantic_domains
from streamfile import StreamFile


@dataclass(frozen=True)
class BuildSpec:
    dir: Path
    name: str
    pre_build: Callable[[], None]
    post_build: Callable[[], None]


@dataclass
class Job:
    """Dataclass for a command to be queued with the working directory to be used."""

    command: List[str]
    work_dir: Optional[Path]


class JobQueue:
    """Class to manage a queue of jobs."""

    def __init__(self, name: str) -> None:
        self.name = name
        self.status = JobStatus.RUNNING
        self.job_list: List[Job] = []
        self.curr_job: Optional[subprocess.Popen[str]] = None
        self.returncode = 0
        self.output_stream = StreamFile()
        self.error_stream = StreamFile()

    def add_job(self, job: Job) -> None:
        """Add a job to the current queue."""
        self.job_list.append(job)

    def start_next(self) -> bool:
        """
        Starts the next job in the queue.

        Returns True if the job was started.  Returns False if a job is currently
        running or if the queue is empty.
        """
        if self.curr_job is not None and self.curr_job.poll() is None:
            logging.debug(f"{self.name}.start_next(): called while job is still running.")
            return False
        if len(self.job_list) > 0:
            next_job = self.job_list.pop(0)
            self.output_stream.open()
            self.error_stream.open()
            self.curr_job = subprocess.Popen(
                next_job.command,
                cwd=next_job.work_dir,
                stdout=self.output_stream.file(),
                stderr=self.error_stream.file(),
                encoding="utf-8",
            )
            logging.debug(f"{self.name}.start_next(): new job started - {next_job}")
            return True
        logging.debug(f"{self.name}.start_next(): no more jobs to run.")
        return False

    def check_jobs(self) -> JobStatus:
        """
        Check if all jobs in the queue have completed.

        If the current job has finished, and there are more jobs to run, it will start the next
        job.
        """
        if self.status != JobStatus.RUNNING:
            return self.status
        if self.curr_job is not None:
            # See if the job is still running
            if self.curr_job.poll() is None:
                logging.debug(f"{self.name} job is running.")
                return self.status
            # Current job has finished
            if self.curr_job.returncode == 0:
                logging.info(f"{self.name} job has finished.")
                self.output_stream.print()
            else:
                logging.error(f"{self.name} job failed.")
                self.error_stream.print()
                self.returncode = self.curr_job.returncode
                # skip remaining jobs
                self.job_list = []
                self.status = JobStatus.ERROR
                return self.status
            self.curr_job = None
        # start the next job.  If there are no more jobs to run, we have
        # finished successfully
        if not self.start_next():
            self.status = JobStatus.SUCCESS
        return self.status


project_dir = Path(__file__).resolve().parent.parent.parent
"""Absolute path to the checked out repository."""


# Pre-build/post-build functions for the different build components
def build_semantic_domains() -> None:
    """Create the semantic domain definition files."""
    source_dir = project_dir / "deploy" / "scripts" / "semantic_domains" / "xml"
    output_dir = project_dir / "database" / "semantic_domains"
    generate_semantic_domains(list(source_dir.glob("*.xml")), output_dir)


def create_release_file() -> None:
    """Create the release.js file to be built into the Frontend."""
    release_file = project_dir / "public" / "scripts" / "release.js"
    set_release(get_release(), release_file)


def rm_release_file() -> None:
    """Remove release.js file if it exists."""
    release_file = project_dir / "public" / "scripts" / "release.js"
    if release_file.exists():
        release_file.unlink()


def no_op() -> None:
    pass


# Create a dictionary to look up the build spec from
# a component name
build_specs: Dict[str, BuildSpec] = {
    "backend": BuildSpec(project_dir / "Backend", "backend", no_op, no_op),
    "database": BuildSpec(project_dir / "database", "database", build_semantic_domains, no_op),
    "maintenance": BuildSpec(project_dir / "maintenance", "maint", no_op, no_op),
    "frontend": BuildSpec(project_dir, "frontend", create_release_file, rm_release_file),
}


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
        choices=build_specs.keys(),
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
        "--no-cache", action="store_true", help="Do not use cached images from previous builds."
    )
    parser.add_argument(
        "--pull",
        action="store_true",
        help="Always attempt to pull a newer version of an image used in the build.",
    )
    parser.add_argument(
        "--quiet",
        "-q",
        action="store_true",
        help="Run the docker build commands with '--quiet' instead of '--progress plain'.",
    )
    group = parser.add_mutually_exclusive_group()
    group.add_argument(
        "--debug",
        "-d",
        action="store_true",
        help="Print extra debugging information.",
    )
    return parser.parse_args()


def main() -> None:
    """Build the Docker images for The Combine."""
    args = parse_args()

    # Setup the logging level.  The command output will be printed on stdout/stderr
    # independent of the logging facility
    if args.debug:
        log_level = logging.DEBUG
    elif args.quiet:
        log_level = logging.WARNING
    else:
        log_level = logging.INFO
    logging.basicConfig(format="%(levelname)s:%(message)s", level=log_level)

    # Setup required build engine - docker or nerdctl
    if args.nerdctl:
        build_prog = ["nerdctl", "-n", args.namespace]
    else:
        build_prog = ["docker"]

    # Setup build options
    build_opts: List[str] = []
    if args.quiet:
        build_opts = ["--quiet"]
    else:
        build_opts = ["--progress", "plain"]
    if args.no_cache:
        build_opts += ["--no-cache"]
    if args.pull:
        build_opts += ["--pull"]

    if args.components is not None:
        to_do = args.components
    else:
        to_do = build_specs.keys()

    # Create the set of jobs to be run for all components
    job_set: Dict[str, JobQueue] = {}
    for component in to_do:
        spec = build_specs[component]
        spec.pre_build()
        image_name = get_image_name(args.repo, spec.name, args.tag)
        job_set[component] = JobQueue(component)
        job_set[component].add_job(
            Job(
                build_prog
                + ["build"]
                + build_opts
                + [
                    "-t",
                    image_name,
                    "-f",
                    "Dockerfile",
                    ".",
                ],
                spec.dir,
            )
        )
        if args.repo is not None:
            if args.quiet:
                push_args = ["--quiet"]
            else:
                push_args = []
            job_set[component].add_job(Job(build_prog + ["push"] + push_args + [image_name], None))
        logging.info(f"Building component {component}")

    # Run jobs in parallel - one job per component
    build_returncode = 0
    while True:
        # loop through the running jobs until there is no more work left
        running_jobs = False
        for component in job_set:
            if job_set[component].check_jobs() == JobStatus.RUNNING:
                running_jobs = True
        if not running_jobs:
            break
        time.sleep(5.0)
    # Run the post_build cleanup functions
    for component in to_do:
        build_specs[component].post_build()

    # Print job summary if output mode is ALL
    if not args.quiet:
        logging.info("Job Summary:")
        for component in job_set:
            curr_queue = job_set[component]
            if curr_queue.status == JobStatus.ERROR:
                build_returncode = curr_queue.returncode
            logging.info(f"{component}: {curr_queue.status.value}")
    sys.exit(build_returncode)


if __name__ == "__main__":
    main()
