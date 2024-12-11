#!/usr/bin/env python
"""Install the pre-requisite helm charts for the Combine on a k8s cluster."""

from __future__ import annotations

import argparse
import logging
import os
from pathlib import Path
import sys
import tempfile
from typing import Any, Dict, List

from enum_types import ExitStatus, HelmAction
from kube_env import KubernetesEnvironment, add_helm_opts, add_kube_opts
from utils import init_logging, run_cmd
import yaml

scripts_dir = Path(__file__).resolve().parent
"""Absolute path to the directory of the deploy scripts."""


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Build containerd container images for project.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    add_kube_opts(parser, add_debug=False)
    add_helm_opts(parser)
    parser.add_argument(
        "--chart-dir", help="Directory for the chart files when doing an airgap installation."
    )
    parser.add_argument(
        "--config",
        "-c",
        help="Configuration file for the cluster type(s).",
        default=str(scripts_dir / "setup_files" / "cluster_config.yaml"),
    )
    logging_group = parser.add_mutually_exclusive_group()
    logging_group.add_argument(
        "--quiet",
        "-q",
        action="store_true",
        help="Print less output information.",
    )
    logging_group.add_argument(
        "--debug",
        "-d",
        action="store_true",
        help="Print extra debugging information.",
    )
    parser.add_argument(
        "--type",
        "-t",
        default="standard",
        help="Type of Kubernetes cluster to be setup as defined in the config file.",
    )
    return parser.parse_args()


def main() -> None:
    """Install pre-requisite helm charts."""
    args = parse_args()
    init_logging(args)

    with open(args.config) as file:
        config: Dict[str, Any] = yaml.safe_load(file)

    # Verify that the requested type is in the configuration
    if args.type not in config["clusters"]:
        logging.error(
            f"Cluster type '{args.type}' is not in the configuration file, {args.config}"
        )
        sys.exit(ExitStatus.FAILURE.value)

    # Note that the helm repo commands affect the helm client and therefore
    # are not affected by the helm options
    this_cluster: List[str] = config["clusters"][args.type]

    # if the chart is to be installed from a file, we don't need to
    # add the repo
    if args.chart_dir is None:
        curr_repo_list: List[str] = []
        helm_cmd_results = run_cmd(
            ["helm", "repo", "list", "-o", "yaml"], print_cmd=not args.quiet, check_results=False
        )
        if helm_cmd_results.returncode == 0:
            curr_helm_repos = yaml.safe_load(helm_cmd_results.stdout)
            for repo in curr_helm_repos:
                curr_repo_list.append(repo["name"])
        # Check for repos that need to be added
        for chart_descr in this_cluster:
            repo_spec = config[chart_descr]["repo"]
            if repo_spec["name"] not in curr_repo_list:
                run_cmd(
                    ["helm", "repo", "add", repo_spec["name"], repo_spec["url"]],
                    print_cmd=not args.quiet,
                    print_output=not args.quiet,
                )
        # Update the helm repos with added repos and to update chart versions in
        # existing repos.
        run_cmd(["helm", "repo", "update"], print_cmd=not args.quiet, print_output=not args.quiet)

    # List current charts
    chart_list_results = run_cmd(["helm", "list", "-A", "-o", "yaml"])
    curr_charts: List[str] = []
    for chart in yaml.safe_load(chart_list_results.stdout):
        curr_charts.append(chart["name"])

    # Add the current script directory to the OS Environment variables
    os.environ["SCRIPTS_DIR"] = str(scripts_dir)
    # Add an empty analytics key if not defined in the OS Environment variables
    if "HONEYCOMB_API_KEY" not in os.environ:
        os.environ["HONEYCOMB_API_KEY"] = ""

    # Verify the Kubernetes/Helm environment
    kube_env = KubernetesEnvironment(args)
    # Install/upgrade the required charts
    for chart_descr in this_cluster:
        chart_spec = config[chart_descr]["chart"]
        # install the chart
        helm_cmd = kube_env.get_helm_cmd()
        if chart_spec["name"] in curr_charts:
            helm_action = HelmAction.UPGRADE
        else:
            helm_action = HelmAction.INSTALL
        helm_cmd.extend(
            [
                "-n",
                chart_spec["namespace"],
                helm_action.value,
                chart_spec["name"],
            ]
        )
        if args.chart_dir is None:
            # chart is found in the repo
            helm_cmd.extend(
                [
                    chart_spec["reference"],
                ]
            )
            if "version" in chart_spec:
                helm_cmd.extend(["--version", chart_spec["version"]])
        else:
            # chart is a *.tgz file
            chart_files = list((Path(args.chart_dir).resolve() / chart_spec["name"]).glob("*.tgz"))
            if not chart_files:
                logging.error(f"No chart file for {chart['name']} in {args.chart_dir}.")
                sys.exit(1)
            if len(chart_files) > 1:
                logging.warning(
                    f"Expecting 1 chart file for {chart['name']}, found {len(chart_files)}"
                )
            helm_cmd.append(str(chart_files[0]))

        if helm_action == HelmAction.INSTALL:
            helm_cmd.append("--create-namespace")
        if ("wait" in chart_spec and chart_spec["wait"]) or args.timeout is not None:
            helm_cmd.append("--wait")
            if args.timeout is not None:
                helm_cmd.extend(["--timeout", args.timeout])
        if args.dry_run:
            helm_cmd.append("--dry-run")
        with tempfile.TemporaryDirectory() as temp_dir:
            if "override" in chart_spec:
                override_file = Path(temp_dir).resolve() / "overrides.yaml"
                with open(override_file, "w") as file:
                    yaml.dump(chart_spec["override"], file)
                helm_cmd.extend(["-f", str(override_file)])
            if "additional_args" in chart_spec:
                for arg in chart_spec["additional_args"]:
                    helm_cmd.append(arg.format(**os.environ))
            helm_cmd_str = " ".join(helm_cmd)
            logging.debug(f"Running: {helm_cmd_str}")
            # Run with os.system so that there is feedback on stdout/stderr while the
            # command is running
            exit_status = os.waitstatus_to_exitcode(os.system(helm_cmd_str))
            logging.info(
                f'helm {helm_action.value} of {chart_spec["name"]} '
                + f"returned exit status {hex(exit_status)}"
            )
            if exit_status != 0:
                sys.exit(exit_status)


if __name__ == "__main__":
    main()
