"""Run commands on the Combine services."""

from __future__ import annotations

from enum import Enum, unique
import json
from pathlib import Path
import re
import subprocess
import sys
from typing import Any, Dict, List, Optional

from maint_utils import run_cmd


@unique
class Permission(Enum):
    """Define enumerated type for Combine user permissions."""

    WordEntry = 1
    # Integer value 2 is currently unused.
    MergeAndReviewEntries = 3
    ImportExport = 4
    DeleteEditSettingsAndUsers = 5
    Owner = 6


class CombineApp:
    """Run commands on the Combine services."""

    @unique
    class Component(Enum):
        Database = "database"
        Backend = "backend"
        Frontend = "frontend"
        Maintenance = "maintenance"

    def __init__(
        self, *, kubeconfig_path: Optional[Path] = None, k8s_namespace: str = "thecombine"
    ) -> None:
        """Initialize the CombineApp from the configuration file."""
        self.kubectl_opts = ["-n", f"{k8s_namespace}"]
        if kubeconfig_path is not None and kubeconfig_path.is_file():
            self.kubectl_opts.append(f"--kubeconfig={kubeconfig_path}")
        # Cache the pod id so we only have to look it up once
        self.pod_id_cache: Dict[str, str] = {}

    def exec(
        self,
        pod_id: str,
        cmd: List[str],
        *,
        exec_opts: Optional[List[str]] = None,
        check_results: bool = True,
    ) -> subprocess.CompletedProcess[str]:
        """
        Run a kubectl 'exec' command in a Combine Kubernetes cluster.

        Args:
            pod_id: The name of the Combine pod_id that corresponds to the
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
            ["kubectl"]
            + self.kubectl_opts
            + [
                "exec",
            ]
            + exec_opts
            + [pod_id, "--"]
            + cmd,
            check_results=check_results,
        )

    def kubectl(self, cmd: List[str]) -> subprocess.CompletedProcess[str]:
        """Run kubectl command adding the configuration file and namespace."""
        return run_cmd(["kubectl"] + self.kubectl_opts + cmd)

    @staticmethod
    def object_id_to_str(buffer: str) -> str:
        """Extract a MongoDB ObjectId from a string."""
        obj_id_pattern = re.compile(r'ObjectId\(("[0-9a-f]{24}")\)', re.MULTILINE)
        return obj_id_pattern.sub(r"\1", buffer)

    def get_pod_id(self, service: CombineApp.Component, *, instance: int = 0) -> str:
        """Look up the Kubernetes pod id for the specified service."""
        if service.value not in self.pod_id_cache:
            self.pod_id_cache[service.value] = self.kubectl(
                [
                    "get",
                    "pods",
                    "--field-selector=status.phase==Running",
                    "-o" f"jsonpath={{.items[{instance}].metadata.name}}",
                    f"-l=combine-component={service}",
                ]
            ).stdout.strip()
        return self.pod_id_cache[service.value]

    def db_cmd(self, cmd: str) -> Optional[Dict[str, Any]]:
        """Run the supplied database command using the mongo shell in the database container.

        Note:
            A list of results can be returned if the query to be evaluated returns a list of
            values.  mypy is strict about indexing Union[Dict, List], so in general we cannot
            properly type hint this return type without generating many false positives.
        """
        db_results = self.exec(
            self.get_pod_id(CombineApp.Component.Database),
            ["/usr/bin/mongo", "--quiet", "CombineDatabase", "--eval", cmd],
        )
        result_str = self.object_id_to_str(db_results.stdout)
        if result_str != "":
            result_dict: Dict[str, Any] = json.loads(result_str)
            return result_dict
        return None

    def db_query(
        self, collection: str, query: str, projection: str = "{}"
    ) -> List[Dict[str, Any]]:
        """Run the supplied database query returning an Array."""
        cmd = f"db.{collection}.find({query}, {projection}).toArray()"
        db_results = self.exec(
            self.get_pod_id(CombineApp.Component.Database),
            ["/usr/bin/mongo", "--quiet", "CombineDatabase", "--eval", cmd],
        )
        result_str = self.object_id_to_str(db_results.stdout)
        if result_str != "":
            result_array: List[Dict[str, Any]] = json.loads(result_str)
            return result_array
        return []

    def get_project_id(self, project_name: str) -> Optional[str]:
        """Look up the MongoDB ObjectId for the project from the Project Name."""
        results: Optional[List[Dict[str, Any]]] = self.db_cmd(  # type: ignore
            f'db.ProjectsCollection.find({{ name: "{project_name}"}},{{ name: 1}}).toArray()'
        )

        if results is None:
            return None

        if len(results) == 1:
            return results[0]["_id"]  # type: ignore
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
            return results["_id"]  # type: ignore
        results = self.db_cmd(
            f'db.UsersCollection.findOne({{ email: "{user}"}}, {{ username: 1 }})'
        )
        if results is not None:
            return results["_id"]  # type: ignore
        return None

    def get_project_roles(self, proj_id: str, perm: Permission) -> List[Dict[str, Any]]:
        """Get the list of all user roles for a project that have the requested permission set."""
        query = f"{{projectId: '{proj_id}', permissions: {{ $all: [{perm.value}]}}}}"
        result_fields = "{projectId: 1, permissions: 1}"
        return self.db_query("UserRolesCollection", query, result_fields)
