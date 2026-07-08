"""Run commands on the Combine services."""

from __future__ import annotations

from enum import Enum, unique
import json
import logging
import os
from pathlib import Path
import subprocess
import sys
import time
from typing import Any, Dict, List, Optional

from maint_utils import run_cmd

# A `kubectl cp` streams a tar over the exec channel and can stall intermittently,
# which would otherwise hang forever.  Bound each copy with a timeout so a stalled
# stream gets killed, and retry a few times so a transient stall is recovered.
CP_ATTEMPTS = int(os.getenv("kubectl_cp_attempts", "3"))
CP_TIMEOUT = float(os.getenv("kubectl_cp_timeout", "300"))
# A fast-failing copy can exhaust all attempts within the same second, giving a
# transient failure no time to clear; pause between attempts so the retries span time.
CP_RETRY_DELAY = 3.0


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
        timeout: Optional[float] = None,
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
            timeout: If set, kill the command and raise subprocess.TimeoutExpired
                     when it runs longer than this many seconds.
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
            timeout=timeout,
        )

    def kubectl(
        self, cmd: List[str], *, check_results: bool = True, timeout: Optional[float] = None
    ) -> subprocess.CompletedProcess[str]:
        """Run kubectl command adding the configuration file and namespace.

        Args:
            cmd: The kubectl subcommand and its arguments.
            check_results: Indicate if subprocess should not check for failure.
            timeout: If set, kill the command and raise subprocess.TimeoutExpired
                     when it runs longer than this many seconds.
        """
        return run_cmd(
            ["kubectl"] + self.kubectl_opts + cmd,
            check_results=check_results,
            timeout=timeout,
        )

    def cp_with_retry(
        self,
        cp_args: List[str],
        *,
        label: str,
        timeout: float = CP_TIMEOUT,
        attempts: int = CP_ATTEMPTS,
    ) -> None:
        """Run a `kubectl cp`, bounding it with a timeout and retrying transient stalls.

        `kubectl cp` streams a tar over the exec channel and can stall intermittently
        with no output.  Each attempt is killed after `timeout` seconds and the copy is
        tried up to `attempts` times, pausing briefly between attempts.  If every
        attempt fails, the failing copy is logged and the process exits non-zero so
        the failure surfaces instead of hanging silently.

        Args:
            cp_args: Arguments to `kubectl cp` (source and destination, plus any flags).
            label: Human-readable description of what is being copied, for logging.
            timeout: Per-attempt timeout in seconds.
            attempts: Total number of attempts before giving up.
        """
        for attempt in range(1, attempts + 1):
            try:
                proc = self.kubectl(["cp"] + cp_args, check_results=False, timeout=timeout)
            except subprocess.TimeoutExpired:
                logging.warning(
                    f"Copy of {label} timed out after {timeout:g}s "
                    f"(attempt {attempt}/{attempts})."
                )
            else:
                if proc.returncode == 0:
                    logging.debug(f"stderr:\n{proc.stderr.strip()}")
                    logging.debug(f"stdout:\n{proc.stdout.strip()}")
                    return
                logging.warning(
                    f"Copy of {label} failed with return code {proc.returncode} "
                    f"(attempt {attempt}/{attempts}).\n{proc.stderr.strip()}"
                )
            if attempt < attempts:
                time.sleep(CP_RETRY_DELAY)
        logging.error(f"Failed to copy {label} after {attempts} attempts; aborting.")
        sys.exit(1)

    def get_pod_id(self, service: CombineApp.Component, *, instance: int = 0) -> str:
        """Look up the Kubernetes pod id for the specified service."""
        if service.value not in self.pod_id_cache:
            self.pod_id_cache[service.value] = self.kubectl(
                [
                    "get",
                    "pods",
                    "--field-selector=status.phase==Running",
                    "-o" f"jsonpath={{.items[{instance}].metadata.name}}",
                    f"-l=combine-component={service.value}",
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
            ["/usr/bin/mongosh", "--quiet", "CombineDatabase", "--eval", f"JSON.stringify({cmd})"],
        )
        result_str = db_results.stdout
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
            ["/usr/bin/mongosh", "--quiet", "CombineDatabase", "--eval", f"JSON.stringify({cmd})"],
        )
        result_str = db_results.stdout
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
