#!/usr/bin/env python

"""
Install The Combine Helm charts on a specified Kubernetes cluster.

The setup_combine.py script users a configuration file to customize the installation of The Combine
on the specified target.

For each target, the configuration file lists:
    - the configuration profile to be used
    - target specific values to be overridden

For each profile, the configuration file lists the charts that are to be installed.

For each chart, the configuration file lists:
    - namespace for the chart
    - a list of secrets to be defined from environment variables

The script also adds value definitions from a profile specific configuration file if it exists.
"""
import argparse
import logging
from pathlib import Path
import sys
import tempfile
from typing import Any, Dict, List

from app_release import get_release
from aws_env import init_aws_environment
import combine_charts
from enum_types import ExitStatus, HelmAction
from helm_utils import (
    add_language_overrides,
    add_override_values,
    add_profile_values,
    create_secrets,
    get_installed_charts,
    get_target,
)
from kube_env import KubernetesEnvironment, add_helm_opts, add_kube_opts
from utils import add_namespace, init_logging, run_cmd
import yaml

scripts_dir = Path(__file__).resolve().parent
"""Directory for the deploy scripts"""


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate Helm Charts for The Combine.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    # Arguments used by the Kubernetes tools
    add_kube_opts(parser, add_debug=False)
    # Arguments used by Helm
    add_helm_opts(parser)
    # Arguments specific to setting up The Combine
    parser.add_argument(
        "--clean", action="store_true", help="Delete chart, if it exists, before installing."
    )
    parser.add_argument(
        "--config",
        "-c",
        help="Configuration file for the target(s).",
        default=str(scripts_dir / "setup_files" / "combine_config.yaml"),
    )
    parser.add_argument(
        "--langs",
        "-l",
        nargs="*",
        metavar="LANG",
        help="Language(s) that require fonts to be installed on the target cluster.",
    )
    parser.add_argument(
        "--list-targets",
        action="store_true",
        help="List the available targets and exit.",
    )
    parser.add_argument(
        "--profile",
        "-p",
        help="Profile name for the target. "
        "If not specified, the profile will be read from the config file.",
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
    parser.add_argument("--repo", "-r", help="Pull images from the specified image repository.")
    parser.add_argument(
        "--tag",
        "-t",
        default="latest",
        help="Tag for the container images to be installed for The Combine.",
        dest="image_tag",
    )
    parser.add_argument(
        "--target",
        default="localhost",
        help="Target system where The Combine is to be installed.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    init_logging(args)

    # Lookup the cluster configuration
    with open(args.config) as file:
        config: Dict[str, Any] = yaml.safe_load(file)

    # Build the Chart.yaml files from templates
    if args.image_tag != "latest":
        combine_charts.generate(args.image_tag)
    else:
        combine_charts.generate(get_release())

    if args.list_targets:
        for target in config["targets"].keys():
            print(f"   {target}")
        sys.exit(ExitStatus.SUCCESS.value)

    target = args.target
    while target not in config["targets"]:
        target = get_target(config)

    this_config = config["targets"][target]

    if args.profile is None:
        profile = this_config["profile"]
    else:
        profile = args.profile

    # Verify the Kubernetes/Helm environment
    kube_env = KubernetesEnvironment(args)
    # Cache helm command used to alter the target cluster
    helm_cmd = kube_env.get_helm_cmd()
    # Check AWS Environment Variables
    init_aws_environment()

    # Create list of target specific variable values
    target_vars = [f"global.imageTag={args.image_tag}"]

    if args.repo:
        target_vars.append(f"global.imageRegistry={args.repo}")

    # Add any value overrides from the command line
    if args.set:
        target_vars.extend(args.set)

    addl_configs: List[str] = []
    if args.values:
        for filepath in args.values:
            addl_configs.extend(["-f", filepath])

    # Lookup directory for helm files
    helm_dir = scripts_dir.parent / "helm"

    # Open a temporary directory for creating the secrets YAML files
    with tempfile.TemporaryDirectory() as secrets_dir:
        for chart in config["profiles"][profile]["charts"]:
            logging.debug(f"Chart: {chart}")

            # Create the chart namespace if it does not exist
            chart_namespace = config["charts"][chart]["namespace"]
            logging.debug(f"Namespace: {chart_namespace}")
            if add_namespace(chart_namespace, kube_env.get_kubectl_cmd()):
                logging.debug(f"Namespace '{chart_namespace}' created")
                installed_charts: List[str] = []
            else:
                logging.debug(f"Namespace '{chart_namespace}' already exists")
                # Get list of charts in target namespace
                installed_charts = get_installed_charts(helm_cmd, chart_namespace)
            logging.debug(f"Installed charts: {installed_charts}")

            # Set helm_action based on whether chart is already installed
            helm_action = HelmAction.INSTALL
            if chart in installed_charts:
                if args.clean:
                    # Delete existing chart if --clean specified
                    delete_cmd = helm_cmd + [f"--namespace={chart_namespace}", "delete", chart]
                    run_cmd(delete_cmd, print_cmd=not args.quiet, print_output=True)
                else:
                    helm_action = HelmAction.UPGRADE

            # Build the secrets file
            secrets_file = Path(secrets_dir).resolve() / f"secrets_{chart}.yaml"
            include_secrets = create_secrets(
                config["charts"][chart]["secrets"],
                output_file=secrets_file,
                env_vars_req=this_config["env_vars_required"],
            )

            # Create the base helm install command
            chart_dir = helm_dir / chart
            helm_install_cmd = helm_cmd + [
                "--dependency-update",
                f"--namespace={chart_namespace}",
                helm_action.value,
                chart,
                str(chart_dir),
            ]

            # Set the dry-run option if desired
            if args.dry_run:
                helm_install_cmd.append("--dry-run")

            # Set wait and timeout options
            if args.wait or args.timeout is not None:
                helm_install_cmd.append("--wait")
                if args.timeout is not None:
                    helm_install_cmd.extend(["--timeout", args.timeout])

            # Add the profile specific configuration
            add_profile_values(
                config,
                profile_name=profile,
                chart=chart,
                temp_dir=Path(secrets_dir).resolve(),
                helm_cmd=helm_install_cmd,
            )

            # Add the secrets file
            if include_secrets:
                helm_install_cmd.extend(["-f", str(secrets_file)])

            if config["charts"][chart]["install_langs"]:
                add_language_overrides(this_config, chart=chart, langs=args.langs)

            add_override_values(
                this_config,
                chart=chart,
                temp_dir=Path(secrets_dir).resolve(),
                helm_cmd=helm_install_cmd,
            )

            # Add any additional configuration files from the command line
            if len(addl_configs) > 0:
                helm_install_cmd.extend(addl_configs)

            for variable in target_vars:
                helm_install_cmd.extend(["--set", variable])

            # Install the chart
            run_cmd(helm_install_cmd, print_cmd=not args.quiet, print_output=True)


if __name__ == "__main__":
    main()
