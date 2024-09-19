#! /usr/bin/python3

import argparse
import os
from pathlib import Path
import sys
from typing import Any, Dict
import yaml


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate AWS config and credentials file for selected profile.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("profile", nargs="?", default=None, help="Profile to select.")
    parser.add_argument(
        "--clear", action="store_true", help="Clear the AWS environment variables."
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    aws_dir = Path(os.getenv("HOME")).resolve() / ".aws"
    with open(aws_dir / "aws_profiles.yaml") as file:
        config: Dict[str, Any] = yaml.safe_load(file)

    if args.clear:
        with open(aws_dir / "env", mode="w", encoding="utf-8") as env_file:
            env_file.writelines(
                [
                    f"unset AWS_PROFILE\n",
                    f"unset AWS_ECR\n",
                    f"unset AWS_ACCESS_KEY_ID\n",
                    f"unset AWS_SECRET_ACCESS_KEY\n",
                    f"unset AWS_DEFAULT_REGION\n",
                    f"unset AWS_ACCOUNT\n",
                ]
            )
        sys.exit(0)

    # find selected profile
    default = None
    profile_list = []
    for profile in config["profiles"]:
        profile_list.append(profile["name"])
        if args.profile is not None and profile["name"] == args.profile:
            default = profile
            break

    if default is None:
        print("Available profiles are: ", ",".join(profile_list))
        curr_profile = os.getenv("AWS_PROFILE")
        if curr_profile is not None:
            print(f"Current profile is {curr_profile}")
        else:
            print("Current profile is not set.")
        sys.exit(0)

    ## create .aws/config
    with open(aws_dir / "config", mode="w", encoding="utf-8") as cfg_file:
        cfg_file.writelines(["[default]\n", f"region = {default['region']}\n"])
        for profile in config["profiles"]:
            cfg_file.writelines(
                [f"[profile {profile['name']}]\n", f"region = {profile['region']}\n"]
            )

    ## create .aws/credentials
    with open(aws_dir / "credentials", mode="w", encoding="utf-8") as cred_file:
        cred_file.writelines(
            [
                "[default]\n",
                f"aws_access_key_id = {default['aws_access_key_id']}\n",
                f"aws_secret_access_key = {default['aws_secret_access_key']}\n",
            ]
        )
        for profile in config["profiles"]:
            cred_file.writelines(
                [
                    f"[{profile['name']}]\n",
                    f"aws_access_key_id = {profile['aws_access_key_id']}\n",
                    f"aws_secret_access_key = {profile['aws_secret_access_key']}\n",
                ]
            )

    ## create .aws/env
    with open(aws_dir / "env", mode="w", encoding="utf-8") as env_file:
        env_file.writelines(
            [
                f"export AWS_PROFILE={default['name']}\n",
                f"export AWS_ECR={default['account']}.dkr.ecr.{default['region']}.amazonaws.com\n",
                f"export AWS_ACCESS_KEY_ID={default['aws_access_key_id']}\n",
                f"export AWS_SECRET_ACCESS_KEY={default['aws_secret_access_key']}\n",
                f"export AWS_DEFAULT_REGION={default['region']}\n",
                f"export AWS_ACCOUNT={default['account']}\n",
            ]
        )


if __name__ == "__main__":
    main()
