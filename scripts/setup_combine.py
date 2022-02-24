#! /usr/bin/env python3

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
from enum import Enum, unique
import os
from pathlib import Path
import sys
import tempfile
from typing import Any, Dict, List, Optional

from utils import add_namespace, get_helm_opts, run_cmd
import yaml


@unique
class HelmAction(Enum):
    """
    Enumerate helm commands for maintaining The Combine on the target system.

    INSTALL is used when the chart is not already installed on the target.
    UPGRADE is used when the chart is already installed.
    """

    INSTALL = "install"
    UPGRADE = "upgrade"


@unique
class ExitStatus(Enum):
    SUCCESS = 0
    FAILURE = 1


prog_dir = Path(__file__).resolve().parent
"""Directory for the current program"""


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate Helm Charts for The Combine.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--clean", action="store_true", help="Delete chart, if it exists, before installing."
    )
    parser.add_argument(
        "--config",
        "-c",
        help="Configuration file for the target(s).",
        default=str(prog_dir / "setup_files" / "combine_config.yaml"),
    )
    parser.add_argument(
        "--context",
        help="Context in kubectl configuration file to be used.",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable verbose output for helm commands.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Invoke the 'helm install' command with the '--dry-run' option.",
        dest="dry_run",
    )
    parser.add_argument(
        "--image-tag",
        help="Tag for the container images to be installed for The Combine.",
        dest="image_tag",
    )
    parser.add_argument(
        "--kubeconfig",
        "-k",
        help="Set the $KUBECONFIG environment variable for the helm/kubectl commands"
        " invoked by this script.",
    )
    parser.add_argument(
        "--profile",
        "-p",
        help="Profile name for the target. "
        "If not specified, the profile will be read from the config file.",
    )
    parser.add_argument(
        "--target",
        "-t",
        help="Target system where The Combine is to be installed.",
    )
    # Arguments passed to the helm install command
    parser.add_argument(
        "--set",  # matches a 'helm install' option
        nargs="*",
        help="Specify additional Helm configuration variable to override default values."
        " See `helm install --help`",
    )
    parser.add_argument(
        "--values",
        "-f",  # matches a 'helm install' option
        nargs="*",
        help="Specify additional Helm configuration file to override default values."
        " See `helm install --help`",
    )
    return parser.parse_args()


def create_secrets(secrets: List[Dict[str, str]], *, output_file: Path) -> bool:
    """
    Create a YAML file that contains the secrets for the specified chart.

    Returns true if one or more secrets were written to output_file.
    """
    secrets_written = False
    with open(output_file, "w") as secret_file:
        secret_file.write("---\n")
        secret_file.write("global:\n")
        for item in secrets:
            secret_value = os.getenv(item["env_var"])
            if secret_value:
                secret_file.write(f'  {item["config_item"]}: "{secret_value}"\n')
                secrets_written = True
            else:
                response = input(
                    f"*** WARNING: Required Environment Variable {item['env_var']} not set."
                    " Continue?(y/N)"
                )
                if response.upper() != "Y":
                    sys.exit(ExitStatus.FAILURE.value)
    return secrets_written


def get_installed_charts(helm_opts: List[str], helm_namespace: str) -> List[str]:
    """Create a list of the helm charts that are already installed on the target."""
    lookup_results = run_cmd(["helm"] + helm_opts + ["list", "-n", helm_namespace, "-o", "yaml"])
    chart_info: List[Dict[str, str]] = yaml.safe_load(lookup_results.stdout)
    chart_list: List[str] = []
    for chart in chart_info:
        chart_list.append(chart["name"])
    return chart_list


def main() -> None:
    args = parse_args()
    if args.target is None:
        target = input("Enter the target name:")
        if not target:
            sys.exit(ExitStatus.SUCCESS.value)
    else:
        target = args.target

    if args.image_tag is None:
        image_tag = input("Enter image tag to install:")
        if not image_tag:
            sys.exit(ExitStatus.SUCCESS.value)
    else:
        image_tag = args.image_tag

    with open(args.config) as file:
        config: Dict[str, Any] = yaml.safe_load(file)

    if target not in config["targets"]:
        print(f"Cannot find configuration for {target}")
        sys.exit(ExitStatus.FAILURE.value)

    this_config = config["targets"][target]

    if args.profile is None:
        profile = this_config["profile"]
    else:
        profile = args.profile

    # Create a base helm command for commands used to alter
    # the target cluster
    helm_opts = get_helm_opts(args)

    # create list of target specific variable values
    target_vars: List[str] = [f"global.serverName={target}", f"global.imageTag={image_tag}"]

    addl_configs = []
    if args.values:
        for filepath in args.values:
            addl_configs.extend(["-f", filepath])

    # lookup directory for helm files
    helm_dir = prog_dir.parent / "deploy" / "helm"

    # lookup the configuration values for the profile of the selected target
    if profile in config["profiles"]:
        # get the path for the profile configuration file
        profile_config: Optional[Path] = prog_dir / "setup_files" / "profiles" / f"{profile}.yaml"
    else:
        profile_config = None
        print(f"Warning: cannot find profile {profile}", file=sys.stderr)
    # open a temporary directory for creating the secrets YAML files
    with tempfile.TemporaryDirectory() as secrets_dir:
        for chart in config["profiles"][profile]["charts"]:
            # create the chart namespace if it does not exist
            chart_namespace = config["charts"][chart]["namespace"]
            if add_namespace(chart_namespace):
                installed_charts = []
            else:
                # get list of charts in target namespace
                installed_charts = get_installed_charts(helm_opts, chart_namespace)

            # set helm_action based on whether chart is already installed
            helm_action = HelmAction.INSTALL
            if chart in installed_charts:
                if args.clean:
                    # delete existing chart if --clean specified
                    run_cmd(["helm"] + helm_opts + ["delete", chart], print_output=True)
                else:
                    helm_action = HelmAction.UPGRADE

            # build the secrets file
            secrets_file = Path(secrets_dir).resolve() / f"secrets_{chart}.yaml"
            include_secrets = create_secrets(
                config["charts"][chart]["secrets"], output_file=secrets_file
            )
            if "set_values" in this_config:
                target_vars.extend(this_config["set_values"])

            # create the base helm install command
            chart_dir = helm_dir / chart
            helm_install_cmd = (
                ["helm"]
                + helm_opts
                + [
                    "--namespace",
                    chart_namespace,
                    helm_action.value,
                    chart,
                    str(chart_dir),
                ]
            )

            # set the dry-run option if desired
            if args.dry_run:
                helm_install_cmd.extend(["--dry-run"])
            # add the profile specific configuration
            if profile_config is not None and profile_config.exists:
                helm_install_cmd.extend(["-f", str(profile_config)])
            # add the secrets file
            if include_secrets:
                helm_install_cmd.extend(
                    [
                        "-f",
                        str(secrets_file),
                    ]
                )
            # add any additional configuration files from the command line
            if len(addl_configs) > 0:
                helm_install_cmd.extend(addl_configs)
            # last of all, add any value overrides from the command line
            if args.set:
                target_vars.extend(args.set)

            for variable in target_vars:
                helm_install_cmd.extend(["--set", variable])

            # Update chart dependencies
            # Note that this operation is performed on the local helm charts
            # so the kubeconfig and context arguments are not passed to the
            # helm command.
            run_cmd(["helm", "dependency", "update", str(chart_dir)], print_output=True)
            if args.debug:
                print(f"Helm command: {helm_install_cmd}")
            run_cmd(helm_install_cmd, print_output=True)


if __name__ == "__main__":
    main()
