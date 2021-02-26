#!/usr/bin/env python3
"""Run a command in a docker container and return a subprocess.CompletedProcess."""

import enum
import json
import re
import subprocess
import sys
from typing import Any, Dict, List, Optional


@enum.unique
class Permission(enum.IntEnum):
    """Define enumerated type for Combine user permissions."""

    WordEntry = 1
    Unused = 2
    MergeAndCharSet = 3
    ImportExport = 4
    DeleteEditSettingsAndUsers = 5


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


def db_cmd(cmd: str) -> Optional[Dict[str, Any]]:
    """Run the supplied database command using the mongo shell in the database container.

    Note:
        A list of results can be returned if the query to be evaluated returns a list of values.
        mypy is strict about indexing Union[Dict, List], so in general we cannot properly
        type hint this return type without generating many false positives.
    """
    db_results = run_docker_cmd(
        "database", ["/usr/bin/mongo", "--quiet", "CombineDatabase", "--eval", cmd]
    )
    result_str = object_id_to_str(db_results.stdout)
    if result_str:
        result_dict = json.loads(result_str)
        return result_dict
    return None


def object_id_to_str(buffer: str) -> str:
    """Extract a MongoDB ObjectId from a string."""
    obj_id_pattern = re.compile(r'ObjectId\(("[0-9a-f]{24}")\)', re.MULTILINE)
    return obj_id_pattern.sub(r"\1", buffer)


def get_project_id(project_name: str) -> Optional[str]:
    """Look up the MongoDB ObjectId for the project from the Project Name."""
    results: Optional[List[Dict[str, Any]]] = db_cmd(  # type: ignore
        f'db.ProjectsCollection.find({{ name: "{project_name}"}},{{ name: 1}}).toArray()'
    )

    if results is None:
        return None

    if len(results) == 1:
        return results[0]["_id"]
    if len(results) > 1:
        print(f"More than one project is named {project_name}", file=sys.stderr)
        sys.exit(1)
    return None


def get_user_id(user: str) -> Optional[str]:
    """Look up the MongoDB ObjectId for a user from username or e-mail."""
    results = db_cmd(f'db.UsersCollection.findOne({{ username: "{user}"}}, {{ username: 1 }})')
    if results is not None:
        return results["_id"]
    results = db_cmd(f'db.UsersCollection.findOne({{ email: "{user}"}}, {{ username: 1 }})')
    if results is not None:
        return results["_id"]
    return None
