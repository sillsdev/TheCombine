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
import os
from pathlib import Path
import sys
import tempfile
from typing import Any, Dict, List

from enum_types import ExitStatus, HelmAction
from utils import add_helm_opts, add_namespace, get_helm_opts, run_cmd
import yaml

scripts_dir = Path(__file__).resolve().parent
"""Directory for the deploy scripts"""


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate Helm Charts for The Combine.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    add_helm_opts(parser)
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
        "--dry-run",
        action="store_true",
        help="Invoke the 'helm install' command with the '--dry-run' option.",
        dest="dry_run",
    )
    parser.add_argument(
        "--profile",
        "-p",
        help="Profile name for the target. "
        "If not specified, the profile will be read from the config file.",
    )
    parser.add_argument(
        "--quiet",
        "-q",
        action="store_true",
        help="Print less output information.",
    )
    parser.add_argument(
        "--repo", "-r", help="Push images to the specified Docker image repository."
    )
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
    return parser.parse_args()


def create_secrets(
    secrets: List[Dict[str, str]], *, output_file: Path, env_vars_req: bool
) -> bool:
    """
    Create a YAML file that contains the secrets for the specified chart.

    Returns true if one or more secrets were written to output_file.
    """
    secrets_written = False
    missing_env_vars: List[str] = []
    with open(output_file, "w") as secret_file:
        secret_file.write("---\n")
        secret_file.write("global:\n")
        for item in secrets:
            secret_value = os.getenv(item["env_var"])
            if secret_value:
                secret_file.write(f'  {item["config_item"]}: "{secret_value}"\n')
                secrets_written = True
            else:
                missing_env_vars.append(item["env_var"])
    if len(missing_env_vars) > 0:
        print("The following environment variables are not defined:")
        print(", ".join(missing_env_vars))
        if not env_vars_req and input("Continue?(y/N)").upper().startswith("Y"):
            return secrets_written
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


def get_target(config: Dict[str, Any]) -> str:
    """List available targets and get selection from the user."""
    print("Available targets:")
    for key in config["targets"]:
        print(f"   {key}")
    try:
        return input("Enter the target name (Ctrl-C to cancel):")
    except KeyboardInterrupt:
        print("Exiting.")
        sys.exit(ExitStatus.FAILURE.value)


def add_override_values(
    config: Dict[str, Any], *, chart: str, temp_dir: Path, helm_cmd: List[str]
) -> None:
    """Add value overrides specified in the script configuration file."""
    if "override" in config and chart in config["override"]:
        override_file = temp_dir / f"config_{chart}.yaml"
        with open(override_file, "w") as file:
            yaml.dump(config["override"][chart], file)
        helm_cmd.extend(["-f", str(override_file)])


def add_profile_values(
    config: Dict[str, Any], *, profile_name: str, chart: str, temp_dir: Path, helm_cmd: List[str]
) -> None:
    """Add profile specific values for the chart."""
    # lookup the configuration values for the profile of the selected target
    # get the path for the profile configuration file
    if profile_name in config["profiles"]:
        profile_def = scripts_dir / "setup_files" / "profiles" / f"{profile_name}.yaml"
        if profile_def.exists:
            with open(profile_def) as file:
                profile_values = yaml.safe_load(file)
            if chart in profile_values["charts"]:
                profile_file = temp_dir / f"profile_{profile_name}_{chart}.yaml"
                with open(profile_file, "w") as file:
                    yaml.dump(profile_values["charts"][chart], file)
                helm_cmd.extend(["-f", str(profile_file)])
        else:
            print(f"Warning: cannot find profile {profile_name}", file=sys.stderr)


def main() -> None:
    args = parse_args()

    with open(args.config) as file:
        config: Dict[str, Any] = yaml.safe_load(file)

    target = args.target
    while target not in config["targets"]:
        target = get_target(config)

    this_config = config["targets"][target]

    if args.profile is None:
        profile = this_config["profile"]
    else:
        profile = args.profile

    # Create a base helm command for commands used to alter
    # the target cluster
    helm_opts = get_helm_opts(args)

    # create list of target specific variable values
    target_vars = [
        f"global.imageTag={args.image_tag}",
    ]
    if args.repo:
        target_vars.append(f"global.imageRegistry={args.repo}")

    addl_configs: List[str] = []
    if args.values:
        for filepath in args.values:
            addl_configs.extend(["-f", filepath])

    # lookup directory for helm files
    helm_dir = scripts_dir.parent / "helm"

    # open a temporary directory for creating the secrets YAML files
    with tempfile.TemporaryDirectory() as secrets_dir:
        for chart in config["profiles"][profile]["charts"]:
            # create the chart namespace if it does not exist
            chart_namespace = config["charts"][chart]["namespace"]
            if add_namespace(chart_namespace):
                installed_charts: List[str] = []
            else:
                # get list of charts in target namespace
                installed_charts = get_installed_charts(helm_opts, chart_namespace)

            # set helm_action based on whether chart is already installed
            helm_action = HelmAction.INSTALL
            if chart in installed_charts:
                if args.clean:
                    # delete existing chart if --clean specified
                    run_cmd(
                        ["helm"] + helm_opts + ["--namespace", chart_namespace, "delete", chart],
                        print_cmd=not args.quiet,
                        print_output=True,
                    )
                else:
                    helm_action = HelmAction.UPGRADE

            # build the secrets file
            secrets_file = Path(secrets_dir).resolve() / f"secrets_{chart}.yaml"
            include_secrets = create_secrets(
                config["charts"][chart]["secrets"],
                output_file=secrets_file,
                env_vars_req=this_config["env_vars_required"],
            )

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
            add_profile_values(
                config,
                profile_name=profile,
                chart=chart,
                temp_dir=Path(secrets_dir).resolve(),
                helm_cmd=helm_install_cmd,
            )

            # add the secrets file
            if include_secrets:
                helm_install_cmd.extend(
                    [
                        "-f",
                        str(secrets_file),
                    ]
                )

            add_override_values(
                this_config,
                chart=chart,
                temp_dir=Path(secrets_dir).resolve(),
                helm_cmd=helm_install_cmd,
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
            run_cmd(
                ["helm", "dependency", "update", str(chart_dir)],
                print_cmd=not args.quiet,
                print_output=True,
            )
            run_cmd(helm_install_cmd, print_cmd=not args.quiet, print_output=True)


if __name__ == "__main__":
    main()
