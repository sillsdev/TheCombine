#!/usr/bin/env python

"""
Build the containerd images for The Combine.

This script currently supports using 'docker' or 'nerdctl' to build the container images.
The default is 'docker' unless the CONTAINER_CLI env var is set to 'nerdctl'.
'docker' is for Rancher Desktop with the 'dockerd' container runtime or Docker Desktop.
'nerdctl' is for Rancher Desktop with the 'containerd' container runtime.

When 'docker' is used for the build, the BuildKit backend will be enabled.
"""

from __future__ import annotations

from argparse import ArgumentParser, HelpFormatter, Namespace
from dataclasses import dataclass
import logging
import os
from pathlib import Path
import subprocess
import sys
import textwrap
import time
from typing import Callable, Dict, List, Optional

from app_release import get_release, set_release
from enum_types import JobStatus
from sem_dom_import import generate_semantic_domains
from streamfile import StreamFile
from utils import init_logging


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

    def __init__(self, name: str, debug: bool = False) -> None:
        self.debug = debug
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

    def print_out(self) -> None:
        logging.debug("####################")
        logging.debug("Printing the stdout:\n")
        self.output_stream.print()
        logging.debug("####################")

    def print_err(self) -> None:
        logging.debug("####################")
        logging.debug("Printing the stderr:\n")
        self.error_stream.print()
        logging.debug("####################")

    def check_jobs(self) -> JobStatus:
        """
        Check if all jobs in the queue have completed.

        If the current job has finished, and there are more jobs to run,
        it will start the next job.
        """
        if self.status != JobStatus.RUNNING:
            return self.status
        if self.curr_job is not None:
            # See if the job is still running
            if self.curr_job.poll() is None:
                return self.status
            # Current job has finished
            if self.curr_job.returncode == 0:
                logging.info(f"{self.name} job has finished.")
                self.print_out()
                if self.debug:
                    self.print_err()
            else:
                logging.error(f"{self.name} job failed.")
                self.print_err()
                self.returncode = self.curr_job.returncode
                # Skip remaining jobs
                self.job_list = []
                self.status = JobStatus.ERROR
                return self.status
            self.curr_job = None
        # Start the next job; if there are no more to run, we have finished successfully
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


# Create a dictionary to look up the build spec from a component name
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


class RawFormatter(HelpFormatter):
    """
    Allow new lines in help text.

    see https://stackoverflow.com/questions/3853722/how-to-insert-newlines-on-argparse-help-text
    """

    def _fill_text(self, text, width, indent):  # type: ignore
        """Strip the indent from the original python definition that plagues most of us."""
        text = textwrap.dedent(text)
        text = textwrap.indent(text, indent)  # Apply any requested indent.
        text = text.splitlines()  # Make a list of lines
        text = [textwrap.fill(line, width) for line in text]  # Wrap each line
        text = "\n".join(text)  # Join the lines again
        return str(text)


def parse_args() -> Namespace:
    """Parse user command line arguments."""
    parser = ArgumentParser(
        description="Build containerd container images for project.",
        formatter_class=RawFormatter,
    )
    parser.add_argument(
        "--build-args", nargs="*", help="Build arguments to pass to the docker build."
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
    logging_group = parser.add_mutually_exclusive_group()
    logging_group.add_argument(
        "--quiet",
        "-q",
        action="store_true",
        help="Run the docker build commands with '--quiet' instead of '--progress plain'.",
    )
    logging_group.add_argument(
        "--debug",
        "-d",
        action="store_true",
        help="Print extra debugging information.",
    )
    return parser.parse_args()


def main() -> None:
    """Build the Docker images for The Combine."""
    args = parse_args()
    init_logging(args)

    # Setup required build engine - docker or nerdctl
    container_cmd = [os.getenv("CONTAINER_CLI", "docker")]
    match container_cmd[0]:
        case "nerdctl":
            if args.debug:
                container_cmd.append("--debug-full")
            build_cmd = container_cmd + ["-n", args.namespace, "build"]
            push_cmd = container_cmd + ["-n", args.namespace, "push"]
        case "docker":
            if args.debug:
                container_cmd.extend(["-D", "-l", "debug"])
            build_cmd = container_cmd + ["buildx", "build"]
            push_cmd = container_cmd + ["push"]
        case _:
            logging.critical(f"Container CLI '{container_cmd[0]}' is not supported.")
            sys.exit(1)

    # Setup build options
    if args.quiet:
        build_cmd += ["--quiet"]
        push_cmd += ["--quiet"]
    else:
        build_cmd += ["--progress", "plain"]
    if args.no_cache:
        build_cmd += ["--no-cache"]
    if args.pull:
        build_cmd += ["--pull"]
    if args.build_args is not None:
        for build_arg in args.build_args:
            build_cmd += ["--build-arg", build_arg]
    logging.debug(f"build_cmd: {build_cmd}")

    if args.components is not None:
        to_do = args.components
    else:
        to_do = build_specs.keys()

    # Create the set of jobs to be run for all components
    job_set: Dict[str, JobQueue] = {}
    for component in to_do:
        spec = build_specs[component]
        logging.info(f"Starting pre-build for {component}")
        spec.pre_build()
        image_name = get_image_name(args.repo, spec.name, args.tag)
        job_opts = ["-t", image_name, "-f", "Dockerfile", "."]
        job_set[component] = JobQueue(component, debug=args.debug)
        logging.debug(f"Adding job {build_cmd + job_opts}")
        job_set[component].add_job(Job(build_cmd + job_opts, spec.dir))
        if args.repo is not None:
            logging.debug(f"Adding job {push_cmd + [image_name]}")
            job_set[component].add_job(Job(push_cmd + [image_name], None))
        logging.info(f"Building component {component}")

    # Run jobs in parallel - one job per component
    build_returncode = 0
    while True:
        # Loop through the running jobs until there is no more work left
        running_jobs = False
        for component in job_set:
            if job_set[component].check_jobs() == JobStatus.RUNNING:
                running_jobs = True
        if not running_jobs:
            break
        time.sleep(5.0)
    # Run the post_build cleanup functions
    for component in to_do:
        logging.info(f"Starting post-build for {component}")
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
