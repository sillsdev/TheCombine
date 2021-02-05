#!/usr/bin/env python3

"""
This script cleans out old docker images from the AWS ECR repository

Assumptions:
  1. aws-cli version 2 is installed
     (see https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
  2. aws-cli has been configured with the access keys required to read/write to the
     specified repository.  aws-cli can be configures by running:
        aws configure
"""

import argparse
import json
import re
import subprocess
from typing import Dict, List, Optional, Union

# Type definitions for results from AWS "describe-images"
AwsJsonResult = Dict[str, List[Dict[str, Union[str, List[str]]]]]


def parse_args() -> argparse.Namespace:
    # Parse user command line arguments
    parser = argparse.ArgumentParser(
        description="Clean an AWS ECR repository of all images/tags except those listed",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--profile", help="AWS user profile to use to connect to AWS ECR")
    parser.add_argument("repo", help="Docker image repository to be cleaned.")
    parser.add_argument(
        "--keep",
        nargs="+",
        help="List of tags to keep",
    )
    parser.add_argument(
        "--keep-pattern",
        dest="keep_pattern",
        nargs="+",
        help="List of regular expressions that specify tags to keep",
    )
    # Add some debugging options to see what's going on
    parser.add_argument(
        "--dry-run",
        dest="dry_run",
        action="store_true",
        help="Print delete command that would be run instead of executing it",
    )
    parser.add_argument(
        "--verbose", action="store_true", help="Print intermediate values to aid in debugging"
    )
    return parser.parse_args()


def run_aws_cmd(aws_cmd: List[str], verbose: bool = False) -> subprocess.CompletedProcess:

    aws_results = subprocess.run(
        aws_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
        check=True,
    )
    if verbose:
        print(aws_results)
    return aws_results


def build_aws_cmd(
    profile: Optional[str], repo: str, subcommand: str, aws_args: Optional[List[str]] = None
) -> List[str]:

    aws_cmd = ["aws", "ecr"]
    if profile:
        aws_cmd.append(f"--profile={profile}")
    aws_cmd.extend([f"--repository-name={repo}", "--output=json", subcommand])
    if aws_args:
        aws_cmd.extend(aws_args)
    return aws_cmd


def main() -> None:

    args = parse_args()

    # Get a list of the current image tags for the specified repo
    aws_cmd = build_aws_cmd(args.profile, args.repo, "describe-images")
    aws_result = run_aws_cmd(aws_cmd, args.verbose)

    # Load the JSON output of the describe-images command into a 'repo_images'
    # dictionary
    repo_images: AwsJsonResult = json.loads(aws_result.stdout)

    # Join patterns of tags to keep to a single regular expression
    keep_pattern: str = ""
    if args.keep_pattern is not None:
        keep_pattern = "^(?:% s)$" % "|".join(args.keep_pattern)
        if args.verbose:
            print(f"keep_pattern: {keep_pattern}")

    # Create a list of tags that are not on our list of tags to keep
    old_tags: List[str] = []

    # Iterate over image descriptions returned by AWS
    for image_struct in repo_images["imageDetails"]:
        # check to see if each tag should be kept
        for tag in image_struct["imageTags"]:
            if args.verbose:
                print(f"Testing tag: {tag} from {image_struct['imagePushedAt']}")
            # check to see if there are patterns to test
            if keep_pattern and not re.match(keep_pattern, tag):
                # now check to see if it matches any exact tags specified
                if not args.keep or tag not in args.keep:
                    old_tags.append(tag)

    # Remove all the specified image(s)
    if len(old_tags) > 0:
        # Initialize list of images to be removed with the option name for the
        # aws ecr command
        image_ids: List[str] = ["--image-ids"]

        # Convert the list of tags to a set of image-ids for the AWS ECR command
        for tag in old_tags:
            image_ids.append(f"imageTag={tag}")
        aws_cmd = build_aws_cmd(args.profile, args.repo, "batch-delete-image", image_ids)
        if args.dry_run:
            print(f"AWS Command: {aws_cmd}")
        else:
            run_aws_cmd(aws_cmd, args.verbose)
    elif args.verbose:
        print("No images/tags were deleted.")


if __name__ == "__main__":
    main()
