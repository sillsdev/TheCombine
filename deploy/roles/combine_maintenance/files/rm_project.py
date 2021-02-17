#!/usr/bin/env python3
"""Remove a project and its associated data from TheCombine."""

import argparse
import re
import subprocess
import sys
from typing import List, Optional


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    # Parse user command line arguments
    parser = argparse.ArgumentParser(
        description="""Remove a project from the Combine server."""
        """Project data are deleted from the database and"""
        """the backend containers.""",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("projects", nargs="*", help="Project(s) to be removed from TheCombine.")
    parser.add_argument(
        "--verbose", action="store_true", help="Print intermediate values to aid in debugging"
    )
    return parser.parse_args()


def run_docker_cmd(service: str, cmd: List[str], verbose: bool) -> subprocess.CompletedProcess:
    """Run a command in a docker container."""
    docker_cmd = [
        "docker-compose",
        "exec",
        service,
    ] + cmd
    if verbose:
        print(f"Running command: {docker_cmd}")
    try:
        results = subprocess.run(
            docker_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            check=True,
        )
        if verbose:
            if len(results.stdout) > 0:
                print(f"stdout: {results.stdout}")
            if len(results.stderr) > 0:
                print(f"stderr: {results.stderr}")
        return results
    except subprocess.CalledProcessError as err:
        print(f"CalledProcessError returned {err.returncode}")
        print(f"stdout: {err.stdout}")
        print(f"stderr: {err.stderr}")
        sys.exit(err.returncode)


def get_project_id(project_name: str) -> Optional[str]:
    """Look up the MongoDB Object Id for the project from the Project Name."""
    lookup_cmd = [
        "/usr/bin/mongo",
        "--quiet",
        "CombineDatabase",
        "--eval",
        f'db.ProjectsCollection.findOne({{ name: "{project_name}"}},{{ name: 1}})',
    ]
    results = run_docker_cmd("database", lookup_cmd, False)
    obj_id_pattern = re.compile(r'^.*ObjectId\("([0-9a-f]{24})"\).*$')
    obj_id_match = obj_id_pattern.match(results.stdout)
    if obj_id_match:
        return obj_id_match.group(1)
    return None


def main():
    """Remove a project and its associated data from TheCombine."""
    args = parse_args()
    for project in args.projects:
        project_id = get_project_id(project)
        if args.verbose:
            print(f"Remove project {project}")
            print(f"Project ID: {project_id}")
        rm_proj_script = [
            "/usr/bin/mongo",
            "--quiet",
            "--eval",
            f"var projectName='{project}'",
            "/scripts/rm_project.js",
        ]
        run_docker_cmd("database", rm_proj_script, args.verbose)
        run_docker_cmd(
            "backend", ["rm", "-rf", f"/home/app/.CombineFiles/{project_id}"], args.verbose
        )


if __name__ == "__main__":
    main()
