#!/usr/bin/env python
"""Manage the Kubernetes environment for kubectl & helm."""

from __future__ import annotations

import argparse
from typing import List, Optional

from utils import choose_from_list, run_cmd


class KubernetesEnvironment:
    def __init__(self, args: argparse.Namespace, *, prompt_for_context: bool = True) -> None:
        if "kubeconfig" in args and args.kubeconfig is not None:
            self.kubeconfig = args.kubeconfig
        else:
            self.kubeconfig = None
        if "context" in args and args.context is not None:
            # If the user specified a context, use that one.
            self.kubecontext = args.context
        elif prompt_for_context:
            context_list: List[str] = []

            result = run_cmd(
                ["kubectl"] + self.get_kubeconfig() + ["config", "get-contexts", "--no-headers"],
                check_results=True,
            )
            curr_context: Optional[str] = None
            for line in result.stdout.splitlines():
                if line[0] == "*":
                    curr_context = line.split()[1]
                    context_list.append(curr_context)
                else:
                    context_list.append(line.split()[0])

            # If there is more than one context available, prompt the user to make sure
            # that the intended context will be used.
            curr_context = choose_from_list("context", curr_context, context_list)
            if curr_context:
                self.kubecontext = curr_context
            else:
                self.kubecontext = None
        else:
            self.kubecontext = None
        if "debug" in args:
            self.debug = args.debug
        else:
            self.debug = False

    def get_kubeconfig(self) -> List[str]:
        if self.kubeconfig is not None:
            return ["--kubeconfig", self.kubeconfig]
        return []

    def get_helm_cmd(self) -> List[str]:
        """Create list of helm command with general options."""
        helm_cmd = ["helm"] + self.get_kubeconfig()

        if self.kubecontext is not None:
            helm_cmd.extend(["--kube-context", self.kubecontext])
        if self.debug:
            helm_cmd.append("--debug")
        return helm_cmd

    def get_kubectl_cmd(self) -> List[str]:
        """Create list of kubectl command with general options."""
        kubectl_cmd = ["kubectl"] + self.get_kubeconfig()

        if self.kubecontext is not None:
            kubectl_cmd.extend(["--context", self.kubecontext])
        return kubectl_cmd


def add_helm_opts(parser: argparse.ArgumentParser) -> None:
    """Add command line arguments for Helm."""
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Invoke the 'helm install' command with the '--dry-run' option.",
        dest="dry_run",
    )
    parser.add_argument(
        "--wait",
        action="store_true",
        help="Invoke the 'helm install' command with the '--wait' option.",
    )
    parser.add_argument(
        "--timeout",
        help="""
        Maximum time to wait for the helm commands.
        Adds the '--wait' option if not specified in configuration.
        TIMEOUT is specified as a Go Time Duration. See https://pkg.go.dev/time#ParseDuration.
        """,
    )
    # Arguments passed to the helm install command
    parser.add_argument(
        "--set",  # matches a 'helm install' option
        nargs="+",
        help="Specify additional Helm configuration variable to override default values."
        " See `helm install --help`",
    )
    parser.add_argument(
        "--values",
        "-f",  # matches a 'helm install' option
        nargs="+",
        help="Specify additional Helm configuration file to override default values."
        " See `helm install --help`",
    )


def add_kube_opts(parser: argparse.ArgumentParser, *, add_debug: bool = True) -> None:
    """Add commandline arguments for Kubernetes tools."""
    parser.add_argument(
        "--context",
        help="Context in kubectl configuration file to be used.",
    )
    if add_debug:
        parser.add_argument(
            "--debug",
            action="store_true",
            help="Enable debugging output for helm commands.",
        )
    parser.add_argument(
        "--kubeconfig",
        help="Specify the kubectl configuration file to be used.",
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate Helm Charts for The Combine.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    add_kube_opts(parser)
    args = parser.parse_args()

    kube_env = KubernetesEnvironment(args)
    print(f"{kube_env.get_kubectl_cmd()} ...")
    print(f"{kube_env.get_helm_cmd()} ...")
