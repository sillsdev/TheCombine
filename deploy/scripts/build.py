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
from typing import Dict, List, Optional

from app_release import get_release, set_release
from enum_types import JobStatus, OutputMode


@dataclass(frozen=True)
class BuildSpec:
    dir: Path
    name: str


@dataclass
class Job:
    command: List[str]
    work_dir: Optional[Path]


class JobQueue:
    def __init__(self, name: str, output_mode: OutputMode) -> None:
        self.name = name
        self.job_list: List[Job] = []
        self.curr_job: Optional[subprocess.Popen[str]] = None
        self.returncode = 0
        self.output_mode = output_mode

    def add_job(self, job: Job) -> None:
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
            self.curr_job = subprocess.Popen(
                next_job.command,
                cwd=next_job.work_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
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
        if self.curr_job is not None:
            # See if the job is still running
            if self.curr_job.poll() is None:
                logging.debug(f"{self.name} job is running.")
                return JobStatus.RUNNING
            job_out, job_err = self.curr_job.communicate()
            if self.curr_job.returncode == 0:
                logging.info(f"{self.name} job has finished.")
                if self.output_mode == OutputMode.ALL:
                    print(job_out)
                    print(job_err)
            else:
                logging.error(f"{self.name} job failed.")
                self.returncode = self.curr_job.returncode
                # skip remaining jobs
                self.job_list = []
                # Print output if an error independent of preferred output mode
                print(job_err)
                return JobStatus.ERROR
            self.curr_job = None
        if self.start_next():
            return JobStatus.RUNNING
        return JobStatus.SUCCESS


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
    parser.add_argument("--debug", action="store_true", help="Print debugging info.")
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
        "--output-mode",
        "-o",
        choices=[e.value for e in OutputMode],
        default=OutputMode.PROGRESS.value,
        help=(
            "Level of output desired: "
            "none - no output, "
            "progress - start/completion notification for each job, "
            "all - all command output."
        ),
    )

    args = parser.parse_args()
    args.output_mode = OutputMode(args.output_mode)
    return args


def main() -> None:
    """Build the Docker images for The Combine."""
    args = parse_args()

    if args.debug:
        log_level = logging.DEBUG
    elif args.output_mode != OutputMode.NONE:
        log_level = logging.INFO
    else:
        log_level = logging.WARNING
    logging.basicConfig(format="%(levelname)s:%(message)s", level=log_level)

    if args.nerdctl:
        build_prog = ["nerdctl", "-n", args.namespace]
    else:
        build_prog = ["docker"]

    # Setup build options
    build_opts: List[str] = []
    if args.output_mode == OutputMode.ALL:
        build_opts = ["--progress", "plain"]
    else:
        build_opts = ["--quiet"]
    if args.no_cache:
        build_opts += ["--no-cache"]
    if args.pull:
        build_opts += ["--pull"]

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

    # Create the set of jobs to be run for all components
    job_set: Dict[str, JobQueue] = {}
    for component in to_do:
        spec = build_specs[component]
        image_name = get_image_name(args.repo, spec.name, args.tag)
        job_set[component] = JobQueue(component, args.output_mode)
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
            job_set[component].add_job(Job(build_prog + ["push", "--quiet", image_name], None))
        logging.info(f"Building component {component}")

    # Run jobs in parallel - one job per component
    build_returncode = 0
    while True:
        # loop through the running jobs until there is no more work left
        completed: List[str] = []
        for component in job_set:
            job_status = job_set[component].check_jobs()
            if job_status == JobStatus.SUCCESS:
                completed.append(component)
            elif job_status == JobStatus.ERROR:
                if build_returncode != 0:
                    build_returncode = job_set[component].returncode
                completed.append(component)
        # delete any JobQueue objects that have finished
        for component in completed:
            del job_set[component]
        if len(job_set) == 0:
            break
        time.sleep(5.0)
    # Remove the version file
    if release_file.exists():
        release_file.unlink()
    sys.exit(build_returncode)


if __name__ == "__main__":
    main()
