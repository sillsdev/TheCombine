"""Collection of utility functions for the Combine maintenance scripts."""

from __future__ import annotations

import subprocess
import sys
from typing import List


def run_cmd(cmd: List[str], *, check_results: bool = True) -> subprocess.CompletedProcess[str]:
    """Run a command with subprocess and catch any CalledProcessErrors."""
    try:
        return subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            check=check_results,
        )
    except subprocess.CalledProcessError as err:
        print("CalledProcessError")
        print(f"...Command: {err.cmd}")
        print(f"...returncode {err.returncode}")
        print(f"...stdout: {err.stdout}")
        print(f"...stderr: {err.stderr}")
        sys.exit(err.returncode)


def wait_for_dependents(
    deployments: List[str], *, condition: str = "available", timeout: int = 60
) -> bool:
    """
    Wait until dependent deployments get to specified condition.

    Args:
        deployments: list of the deployments to wait for.  The function will
                     wait for all deployments to reach the desired condition
                     or the for the specified timeout time.
        condition: wait until each deployment reaches the specified condition.
        timeout: time to wait for the deployments in seconds.

    Returns:
        true if all deployments reach the condition within the specified time;
        false otherwise.
    """
    deployment_args = []
    for deploy in deployments:
        deployment_args.append(f"deployment/{deploy}")
    results = run_cmd(
        ["kubectl", "wait", f"--for=condition={condition}", f"--timeout={timeout}s"]
        + deployment_args,
        check_results=False,
    )
    if results.returncode != 0:
        return False
    else:
        return True
