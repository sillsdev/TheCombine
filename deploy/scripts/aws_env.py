#! /usr/bin/env python3
"""Set AWS Environment variables from aws cli profiles."""

from __future__ import annotations

import os
import re
from typing import Dict, List, Optional

from utils import choose_from_list, run_cmd


def aws_version() -> Optional[int]:
    """Test if the aws cli version 2 is installed."""
    try:
        result = run_cmd(["aws", "--version"], check_results=False, chomp=True)
    except FileNotFoundError:
        print("AWS CLI version 2 is not installed.")
        return None
    else:
        if result.returncode == 0:
            # get major version number from stdout
            match = re.match(r"aws-cli/(\d+)\..*", result.stdout)
            if match:
                return int(match.group(1))
    return None


def list_aws_profiles() -> List[str]:
    aws_ver = aws_version()
    if aws_ver is not None and aws_ver == 2:
        result = run_cmd(["aws", "configure", "list-profiles"], chomp=True)
        return result.stdout.split("\n")
    return []


def get_profile_var(profile: str, var_name: str) -> str:
    result = run_cmd(["aws", "configure", "--profile", profile, "get", var_name], chomp=True)
    return result.stdout


def init_aws_environment() -> None:
    profile_list = list_aws_profiles()
    # Build a map for looking up a profile name from the access key id.  This
    # algorithm assumes:
    #  - the 'default' profile will be processed first
    #  - if there are profiles using the same access key id, only the last
    #    one will be put into the map
    if len(profile_list) == 0:
        return
    profile_map: Dict[str, str] = {}
    for profile in profile_list:
        key_id = get_profile_var(profile, "aws_access_key_id")
        profile_map[key_id] = profile
    curr_access_key = os.getenv("AWS_ACCESS_KEY_ID", "")
    if curr_access_key in profile_map:
        curr_profile = profile_map[curr_access_key]
    else:
        curr_profile = None
    aws_profile = choose_from_list("AWS Environment", curr_profile, profile_list)
    if aws_profile is not None and aws_profile != curr_profile:
        os.environ["AWS_PROFILE"] = aws_profile
        os.environ["AWS_ACCESS_KEY_ID"] = get_profile_var(aws_profile, "aws_access_key_id")
        os.environ["AWS_SECRET_ACCESS_KEY"] = get_profile_var(aws_profile, "aws_secret_access_key")
        os.environ["AWS_DEFAULT_REGION"] = get_profile_var(aws_profile, "region")
        result = run_cmd(
            [
                "aws",
                "sts",
                "--profile",
                aws_profile,
                "get-caller-identity",
                "--query",
                "Account",
                "--output",
                "text",
            ],
            chomp=True,
        )
        os.environ["AWS_ACCOUNT"] = result.stdout


if __name__ == "__main__":
    init_aws_environment()
    print("AWS Environment:")
    for env_var in [
        "AWS_ACCOUNT",
        "AWS_DEFAULT_REGION",
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
    ]:
        print(f"{env_var}: {os.getenv(env_var, None)}")
