"""Run commands on the Combine services."""

from __future__ import annotations

import enum
import json
from pathlib import Path
import re
import subprocess
import sys
from typing import Any, Dict, List, Optional

from maint_utils import run_cmd


@enum.unique
class Permission(enum.Enum):
    """Define enumerated type for Combine user permissions."""

    WordEntry = 1
    Unused = 2
    MergeAndCharSet = 3
    ImportExport = 4
    DeleteEditSettingsAndUsers = 5


class CombineApp:
    """Run commands on the Combine services."""

    def __init__(self, compose_file_path: Path) -> None:
        """Initialize the CombineApp from the configuration file."""
        if compose_file_path == "":
            self.compose_opts = []
        else:
            self.compose_opts = ["-f", str(compose_file_path)]

    def set_no_ansi(self) -> None:
        """Add '--no-ansi' to the docker-compose options."""
        self.compose_opts.append("--no-ansi")

    def exec(
        self,
        service: str,
        cmd: List[str],
        *,
        exec_opts: Optional[List[str]] = None,
        check_results: bool = True,
    ) -> subprocess.CompletedProcess:
        """
        Run a docker-compose 'exec' command in a Combine container.

        Args:
            service: The name of the Combine service that corresponds to the
                     container that will run the command.
            cmd: A list of strings that specifies the command to be run in the
                     container.
            exec_opts: A list of additional options for the docker-compose exec
                     command, for example, to specify a working directory or a
                     specific user to run the command.
            check_results: Indicate if subprocess should not check for failure.
        Returns a subprocess.CompletedProcess.
        """
        exec_opts = exec_opts or []
        return run_cmd(
            ["docker-compose"]
            + self.compose_opts
            + [
                "exec",
                "-T",
            ]
            + exec_opts
            + [
                service,
            ]
            + cmd,
            check_results=check_results,
        )

    @staticmethod
    def object_id_to_str(buffer: str) -> str:
        """Extract a MongoDB ObjectId from a string."""
        obj_id_pattern = re.compile(r'ObjectId\(("[0-9a-f]{24}")\)', re.MULTILINE)
        return obj_id_pattern.sub(r"\1", buffer)

    @staticmethod
    def get_container_name(service: str) -> Optional[str]:
        """Look up the docker container ID for the specified service."""
        container_id = run_cmd(
            ["docker", "ps", "--filter", f"name={service}", "--format", "{{.Names}}"]
        ).stdout.strip()
        if container_id == "":
            return None
        return container_id

    def db_cmd(self, cmd: str) -> Optional[Dict[str, Any]]:
        """Run the supplied database command using the mongo shell in the database container.

        Note:
            A list of results can be returned if the query to be evaluated returns a list of
            values.  mypy is strict about indexing Union[Dict, List], so in general we cannot
            properly type hint this return type without generating many false positives.
        """
        db_results = self.exec(
            "database", ["/usr/bin/mongo", "--quiet", "CombineDatabase", "--eval", cmd]
        )
        result_str = self.object_id_to_str(db_results.stdout)
        if result_str != "":
            result_dict: Dict[str, Any] = json.loads(result_str)
            return result_dict
        return None

    def start(self, services: List[str]) -> subprocess.CompletedProcess:
        """Start the specified combine service(s)."""
        return run_cmd(["docker-compose"] + self.compose_opts + ["start"] + services)

    def stop(self, services: List[str]) -> subprocess.CompletedProcess:
        """Stop the specified combine service(s)."""
        return run_cmd(
            ["docker-compose"] + self.compose_opts + ["stop", "--timeout", "0"] + services
        )

    def get_project_id(self, project_name: str) -> Optional[str]:
        """Look up the MongoDB ObjectId for the project from the Project Name."""
        results: Optional[List[Dict[str, Any]]] = self.db_cmd(  # type: ignore
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

    def get_user_id(self, user: str) -> Optional[str]:
        """Look up the MongoDB ObjectId for a user from username or e-mail."""
        results = self.db_cmd(
            f'db.UsersCollection.findOne({{ username: "{user}"}}, {{ username: 1 }})'
        )
        if results is not None:
            return results["_id"]
        results = self.db_cmd(
            f'db.UsersCollection.findOne({{ email: "{user}"}}, {{ username: 1 }})'
        )
        if results is not None:
            return results["_id"]
        return None
