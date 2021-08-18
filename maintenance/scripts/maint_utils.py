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
        print(f"CalledProcessError returned {err.returncode}")
        print(f"stdout: {err.stdout}")
        print(f"stderr: {err.stderr}")
        sys.exit(err.returncode)
