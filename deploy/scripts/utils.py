"""
A Collection of useful functions for Python
"""

from __future__ import annotations

import subprocess
import sys
from typing import List, Optional


def run_cmd(
    cmd: List[str],
    *,
    check_results: bool = True,
    print_cmd: bool = False,
    print_output: bool = False,
    chomp: bool = False,
    cwd: Optional[str] = None,
) -> subprocess.CompletedProcess[str]:
    """Run a command with subprocess and catch any CalledProcessErrors."""
    if print_cmd:
        print(f"Running: {' '.join(cmd)}")
    try:
        process_results = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=check_results,
            cwd=cwd,
        )
        if print_output:
            print(process_results.stdout)
        if chomp:
            process_results.stdout = process_results.stdout.rstrip("\r\n\t ")
        return process_results
    except subprocess.CalledProcessError as err:
        print(f"CalledProcessError returned {err.returncode}")
        print(f"command: {err.cmd}")
        print(f"stdout: {err.stdout}")
        print(f"stderr: {err.stderr}")
        sys.exit(err.returncode)


def add_namespace(namespace: str, kube_opts: List[str]) -> bool:
    """
    Create a Kubernetes namespace if and only if it does not exist.

    Returns True if the namespace was added.
    """
    lookup_results = run_cmd(
        ["kubectl"] + kube_opts + ["get", "namespace", namespace], check_results=False
    )
    if lookup_results.returncode != 0:
        run_cmd(["kubectl"] + kube_opts + ["create", "namespace", namespace])
        return True
    return False


def choose_from_list(
    name: str, curr_selection: Optional[str], options: List[str]
) -> Optional[str]:
    """
    Prompt user to choose/confirm a selection from a list.

    The curr_selection is automatically chosen if the options List is empty
    or has the curr_selection as its only member.
    """
    if len(options) == 1 and curr_selection is not None and curr_selection == options[0]:
        return curr_selection
    if len(options) >= 1:
        while True:
            print(f"Choose {name} from:")
            for index, option in enumerate(options):
                print(f"\t{index+1}: {option}")
            if curr_selection is None:
                prompt_str = f"Enter {name}: "
            else:
                prompt_str = f"Enter {name} (Default: {curr_selection}): "
            try:
                reply = input(prompt_str)
            except KeyboardInterrupt:
                print("\nCancelled.")
                sys.exit(1)
            else:
                if not reply:
                    break
                elif reply in options:
                    curr_selection = reply
                    break
                else:
                    try:
                        index = int(reply)
                        if index > 0 and index <= len(options):
                            curr_selection = options[index - 1]
                            break
                        else:
                            curr_selection = None
                    except ValueError:
                        curr_selection = None
                    print(f"{reply} is not in the list.  Please re-enter.")
    return curr_selection
