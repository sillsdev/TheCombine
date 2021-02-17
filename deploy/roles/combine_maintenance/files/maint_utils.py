#!/usr/bin/env python3
"""Run a command in a docker container and return a subprocess.CompletedProcess."""

import re
import subprocess
import sys
from typing import List, Optional


def run_docker_cmd(service: str, cmd: List[str]) -> subprocess.CompletedProcess:
    """Run a command in a docker container."""
    docker_cmd = [
        "docker-compose",
        "exec",
        "-T",
        service,
    ] + cmd
    try:
        return subprocess.run(
            docker_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            check=True,
        )
    except subprocess.CalledProcessError as err:
        print(f"CalledProcessError returned {err.returncode}")
        print(f"stdout: {err.stdout}")
        print(f"stderr: {err.stderr}")
        sys.exit(err.returncode)


def db_cmd(cmd: str) -> subprocess.CompletedProcess:
    """Run the supplied database command using the mongo shell in the database container."""
    return run_docker_cmd(
        "database", ["/usr/bin/mongo", "--quiet", "CombineDatabase", "--eval", cmd]
    )


def object_id(buffer: str) -> Optional[str]:
    """Extract a MongoDB ObjectId from a string."""
    obj_id_pattern = re.compile(r'^.*ObjectId\("([0-9a-f]{24})"\).*$', re.MULTILINE|re.DOTALL)
    obj_id_match = obj_id_pattern.match(buffer)
    if obj_id_match:
        return obj_id_match.group(1)
    return None


def get_project_id(project_name: str) -> Optional[str]:
    """Look up the MongoDB Object Id for the project from the Project Name."""
    results = db_cmd(f'db.ProjectsCollection.findOne({{ name: "{project_name}"}},{{ name: 1}})')
    return object_id(results.stdout)
