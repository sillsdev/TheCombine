"""Utility functions for building a helm command line for maintaining The Combine."""

import logging
import os
from pathlib import Path
import sys
from typing import Any, Dict, List, Optional

from enum_types import ExitStatus
from utils import run_cmd
import yaml

scripts_dir = Path(__file__).resolve().parent


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
        logging.debug("The following environment variables are not defined:")
        logging.debug(", ".join(missing_env_vars))
        if not env_vars_req:
            return secrets_written
        sys.exit(ExitStatus.FAILURE.value)

    return secrets_written


def get_installed_charts(helm_cmd: List[str], helm_namespace: str) -> List[str]:
    """Create a list of the helm charts that are already installed on the target."""
    lookup_results = run_cmd(helm_cmd + ["list", "-a", "-n", helm_namespace, "-o", "yaml"])
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
        logging.info("Exiting.")
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


def add_language_overrides(
    config: Dict[str, Any],
    *,
    chart: str,
    langs: Optional[List[str]],
) -> None:
    """Update override configuration with any languages specified on the command line."""
    override_config = config["override"][chart]
    if langs:
        if "maintenance" not in override_config:
            override_config["maintenance"] = {"localLangList": langs}
        else:
            override_config["maintenance"]["localLangList"] = langs


def add_profile_values(
    config: Dict[str, Any], *, profile_name: str, chart: str, temp_dir: Path, helm_cmd: List[str]
) -> None:
    """Add profile specific values for the chart."""
    # lookup the configuration values for the profile of the selected target
    # get the path for the profile configuration file
    if profile_name in config["profiles"]:
        profile_def = scripts_dir / "setup_files" / "profiles" / f"{profile_name}.yaml"
        if profile_def.exists():
            with open(profile_def) as file:
                profile_values = yaml.safe_load(file)
            if chart in profile_values["charts"]:
                profile_file = temp_dir / f"profile_{profile_name}_{chart}.yaml"
                with open(profile_file, "w") as file:
                    yaml.dump(profile_values["charts"][chart], file)
                helm_cmd.extend(["-f", str(profile_file)])
        else:
            print(f"Warning: cannot find profile {profile_name}", file=sys.stderr)
