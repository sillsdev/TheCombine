"""
A Collection of useful functions for Python
"""

from __future__ import annotations

import argparse
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


def add_helm_opts(parser: argparse.ArgumentParser) -> None:
    """
    Add commandline arguments that are shared between scripts calling helm.

    Sets up '--verbose' as the equivalent of '--debug'.
    """
    parser.add_argument(
        "--context",
        help="Context in kubectl configuration file to be used.",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debugging output for helm commands.",
    )
    parser.add_argument(
        "--kubeconfig",
        help="Specify the kubectl configuration file to be used.",
    )


def get_helm_opts(args: argparse.Namespace) -> List[str]:
    """
    Create list of general helm options based on argparse Namespace.
    """
    helm_opts = []
    if args.kubeconfig:
        helm_opts.extend(["--kubeconfig", args.kubeconfig])
    if args.context:
        helm_opts.extend(["--kube-context", args.context])
    if args.debug:
        helm_opts.append("--debug")
    return helm_opts


def get_kubecfg() -> str:
    curr_context = ""
    context_list: List[str] = []

    result = run_cmd(["kubectl", "config", "get-contexts", "--no-headers"], check_results=True)
    for line in result.stdout.splitlines():
        if line[0] == '*':
            curr_context = line.split()[1]
            context_list.append(curr_context)
        else:
            context_list.append(line.split()[0])
    
    if len(context_list) > 1:
        print("Available contexts:")
        for context in context_list:
            print(f"\t{context}")
        while True:
            reply = input(f"Select context({curr_context}): ")
            if not reply:
                break
            elif reply in context_list:
                curr_context = reply
                break
            else:
                print("Reply not recognized.  Please re-enter.")
    return curr_context
