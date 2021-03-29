"""Collection of utility functions for the Combine maintenance scripts."""

import enum
import re
import subprocess
import sys
from typing import List, Optional


@enum.unique
class Permission(enum.IntEnum):
    """Define enumerated type for Combine user permissions."""

    WordEntry = 1
    Unused = 2
    MergeAndCharSet = 3
    ImportExport = 4
    DeleteEditSettingsAndUsers = 5


def object_id_to_str(buffer: str) -> str:
    """Extract a MongoDB ObjectId from a string."""
    obj_id_pattern = re.compile(r'ObjectId\(("[0-9a-f]{24}")\)', re.MULTILINE)
    return obj_id_pattern.sub(r"\1", buffer)


def get_container_id(service: str) -> Optional[str]:
    """Look up the docker container ID for the specified service."""
    container_id = run_cmd(
        ["docker", "ps", "--filter", f"name={service}", "--format", "{{.Names}}"]
    ).stdout.strip()
    if not container_id:
        return None
    return container_id


def run_cmd(cmd: List[str], *, check_results: bool = True) -> subprocess.CompletedProcess:
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
        print(f"CalledProcessError returned {err.returncode}")
        print(f"stdout: {err.stdout}")
        print(f"stderr: {err.stderr}")
        sys.exit(err.returncode)
