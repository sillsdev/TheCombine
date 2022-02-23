#!/usr/bin/env python3
"""Install the pre-requisite helm charts for the Combine on a k8s cluster."""

import argparse
from pathlib import Path
from typing import Any, Dict, List

from utils import add_namespace, run_cmd
import yaml

prog_dir = Path(__file__).resolve().parent
"""Absolute path to the checked out repository."""


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Build containerd container images for project.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "-type",
        choices=["docker-desktop", "nuc", "rancher-desktop"],
        default="docker-desktop",
        help="Type of Kubernetes cluster to be setup.",
    )
    parser.add_argument(
        "--config",
        "-c",
        help="Configuration file for the target(s).",
        default=str(prog_dir / "setup_files" / "cluster_config.yaml"),
    )
    parser.add_argument(
        "--verbose", "-v", action="store_true", help="Print output of commands upon completion."
    )
    return parser.parse_args()


def main() -> None:
    """Install pre-requisite helm charts."""
    args = parse_args()
    with open(args.config) as file:
        config: Dict[str, Any] = yaml.safe_load(file)

    this_cluster: List[str] = config["clusters"][args.type]
    helm_cmd_results = run_cmd(["helm", "repo", "list", "-o", "yaml"])
    curr_helm_repos = yaml.safe_load(helm_cmd_results.stdout)
    curr_repo_list = []
    for repo in curr_helm_repos:
        curr_repo_list.append(repo["name"])
    # Check for repos that need to be added
    repo_added = False
    for chart_descr in this_cluster:
        repo_spec = config[chart_descr]["repo"]
        if repo_spec["name"] not in curr_repo_list:
            run_cmd(
                ["helm", "repo", "add", repo_spec["name"], repo_spec["url"]],
                print_output=args.verbose,
            )
            repo_added = True
    if repo_added:
        run_cmd(["helm", "repo", "update"], print_output=args.verbose)

    # List current charts
    chart_list_results = run_cmd(["helm", "list", "-o", "yaml"])
    curr_charts = []
    for chart in yaml.safe_load(chart_list_results.stdout):
        curr_charts.append(chart["name"])

    # Install the required charts
    for chart_descr in this_cluster:
        chart_spec = config[chart_descr]["chart"]
        # add namespace if needed
        add_namespace(chart_spec["namespace"])
        # install the chart
        helm_cmd = ["helm"]
        if chart_spec["name"] in curr_charts:
            helm_cmd.append("upgrade")
        else:
            helm_cmd.append("install")
        helm_cmd.extend(["-n", chart_spec["namespace"], chart_spec["name"], chart_spec["reference"]])
        if "options" in chart_spec:
            helm_cmd.extend(chart_spec["options"])
        run_cmd(helm_cmd, print_output=args.verbose)


if __name__ == "__main__":
    main()
