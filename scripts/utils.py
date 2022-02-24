"""
A Collection of useful functions for Python
"""

import argparse
import subprocess
import sys
from typing import List


def run_cmd(
    cmd: List[str],
    *,
    check_results: bool = True,
    print_output: bool = False,
) -> subprocess.CompletedProcess[str]:
    """Run a command with subprocess and catch any CalledProcessErrors."""
    try:
        process_results = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            check=check_results,
        )
        if print_output:
            print(process_results.stdout)
        return process_results
    except subprocess.CalledProcessError as err:
        print(f"CalledProcessError returned {err.returncode}")
        print(f"stdout: {err.stdout}")
        print(f"stderr: {err.stderr}")
        sys.exit(err.returncode)


def add_namespace(namespace: str) -> bool:
    """
    Create a Kubernetes namespace if and only if it does not exist.

    Returns True if the namespace was added.
    """
    lookup_results = run_cmd(["kubectl", "get", "namespace", namespace], check_results=False)
    if lookup_results.returncode != 0:
        run_cmd(["kubectl", "create", "namespace", namespace])
        return True
    return False


def get_helm_opts(args: argparse.Namespace) -> List[str]:
    """Create list of general helm options based on argparse Namespace."""
    helm_opts = []
    if args.kubeconfig:
        helm_opts.extend(["--kubeconfig", args.kubeconfig])
    if args.context:
        helm_opts.extend(["--kube-context", args.context])
    if args.debug:
        helm_opts.append("--debug")
    return helm_opts
