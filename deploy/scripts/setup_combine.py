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
import subprocess
import sys
import tempfile
from typing import Any, Dict, List, Optional

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
        "--chart",
        help="Chart to install.  If chart is not specified,"
        " the charts specified in the target's configuration will be installed/upgraded.",
    )
    parser.add_argument(
        "--clean", action="store_true", help="Delete chart, if it exists, before installing."
    )
    parser.add_argument(
        "--config",
        "-c",
        help="Configuration file for the target(s).",
        default=str(prog_dir / "config.yaml"),
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Invoke the 'helm install' command with the '--debug' option.",
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


def get_installed_charts(helm_namespace: str) -> List[str]:
    """Create a list of the helm charts that are already installed on the target."""
    lookup_results = run_cmd(["helm", "list", "-n", helm_namespace, "-o", "yaml"])
    chart_info: List[Dict[str, str]] = yaml.safe_load(lookup_results.stdout)
    chart_list: List[str] = []
    for chart in chart_info:
        chart_list.append(chart["name"])
    return chart_list


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

    # Set KUBECONFIG environment variable if specified
    if args.kubeconfig:
        os.environ["KUBECONFIG"] = args.kubeconfig

    # create list of target specific variable values
    target_vars: List[str] = [f"global.serverName={target}", f"global.imageTag={image_tag}"]
    if args.set:
        target_vars.extend(args.set)

    addl_configs = []
    if args.values:
        for file in args.values:
            addl_configs.extend(["-f", file])

    # lookup directory for helm files
    deploy_dir = Path(__file__).resolve().parent.parent
    helm_dir = deploy_dir / "helm"

    # install each of the helm charts for the selected target
    if profile in config["profiles"]:
        # get the path for the profile configuration file
        profile_config: Optional[Path] = prog_dir / "profiles" / f"{profile}.yaml"
    else:
        profile_config = None
        print(f"Warning: cannot find profile {profile}", file=sys.stderr)
    # open a temporary directory for creating the secrets YAML files
    with tempfile.TemporaryDirectory() as secrets_dir:
        if args.chart is None:
            chart_list: List[str] = config["profiles"][profile]["charts"]
        else:
            chart_list = [args.chart]
        for chart in chart_list:
            # create the chart namespace if it does not exist
            chart_namespace = config["charts"][chart]["namespace"]
            if add_namespace(chart_namespace):
                installed_charts = []
            else:
                # get list of charts in target namespace
                installed_charts = get_installed_charts(chart_namespace)
                if args.debug:
                    print(f"Charts Installed in '{chart_namespace}':\n{installed_charts}")

            # delete existing chart if --clean specified
            helm_action = HelmAction.INSTALL
            if chart in installed_charts:
                if args.clean:
                    run_cmd(["helm", "delete", chart])
                else:
                    helm_action = HelmAction.UPGRADE

            # build the secrets file
            secrets_file = Path(secrets_dir).resolve() / f"secrets_{chart}.yaml"
            include_secrets = create_secrets(
                config["charts"][chart]["secrets"], output_file=secrets_file
            )
            if "set" in this_config:
                config_file = Path(secrets_dir).resolve() / f"config_{chart}.yaml"
                with open(config_file, "w") as file:
                    yaml.dump(this_config["set"], file)

            # create the base helm install command
            chart_dir = helm_dir / chart
            helm_cmd = [
                "helm",
                "--namespace",
                chart_namespace,
                helm_action.value,
                chart,
                str(chart_dir),
            ]
            # set the debug option if desired
            if args.debug:
                helm_cmd.extend(["--debug"])
            # set the dry-run option if desired
            if args.dry_run:
                helm_cmd.extend(["--dry-run"])
            # add the profile specific configuration
            if profile_config is not None and profile_config.exists:
                helm_cmd.extend(["-f", str(profile_config)])
            # add the secrets file
            if include_secrets:
                helm_cmd.extend(
                    [
                        "-f",
                        str(secrets_file),
                    ]
                )
            if config_file is not None:
                helm_cmd.extend(["-f", str(config_file)])
            # add any additional configuration files from the command line
            if len(addl_configs) > 0:
                helm_cmd.extend(addl_configs)
            # last of all, add any value overrides from the command line
            helm_cmd.extend(["--set", ",".join(target_vars)])

            # Update chart dependencies
            run_cmd(["helm", "dependency", "update", str(chart_dir)], print_output=True)
            if args.debug:
                print(f"Helm command: {helm_cmd}")
            run_cmd(helm_cmd, print_output=True)


if __name__ == "__main__":
    main()
