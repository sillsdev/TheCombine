#!/usr/bin/env python3
"""Manage the Kubernetes environment for kubectl & helm."""

from __future__ import annotations

import argparse
from typing import List, Optional

from utils import choose_from_list, run_cmd


class KubernetesEnvironment:
    def __init__(self, args: argparse.Namespace) -> None:
        if "kubeconfig" in args and args.kubeconfig is not None:
            self.kubeconfig = args.kubeconfig
        else:
            self.kubeconfig = None
        if "context" in args and args.context is not None:
            # if the user specified a context, use that one.
            self.kubecontext = args.context
        else:
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

            # If  there is more than one context available, prompt the user to make sure
            # that the intended context will be used.
            curr_context = choose_from_list("context", curr_context, context_list)
            if curr_context:
                self.kubecontext = curr_context
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

    def get_helm_opts(self) -> List[str]:
        """
        Create list of general helm options.
        """
        helm_opts = self.get_kubeconfig()

        if self.kubecontext is not None:
            helm_opts.extend(["--kube-context", self.kubecontext])
        if self.debug:
            helm_opts.append("--debug")
        return helm_opts

    def get_kubectl_opts(self) -> List[str]:
        """
        Create list of general kubectl options.
        """
        kubectl_opts = self.get_kubeconfig()

        if self.kubecontext is not None:
            kubectl_opts.extend(["--context", self.kubecontext])
        return kubectl_opts


def add_kube_opts(parser: argparse.ArgumentParser) -> None:
    """Add commandline arguments for Kubernetes tools."""
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


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate Helm Charts for The Combine.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    add_kube_opts(parser)
    args = parser.parse_args()

    kube_env = KubernetesEnvironment(args)
    print(f"kubectl {kube_env.get_kubectl_opts()} ...")
    print(f"helm {kube_env.get_helm_opts()} ...")
