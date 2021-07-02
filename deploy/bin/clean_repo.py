#!/usr/bin/env python3

"""
This script cleans out old docker images from the AWS ECR repository.

Assumptions:
  1. aws-cli version 2 is installed
     (see https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
  2. aws-cli has been configured with the access keys required to read/write to the
     specified repository.  aws-cli can be configures by running:
        aws configure
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from typing import Dict, List, Optional, Union

# Type definitions for results from AWS "describe-images"
AwsJsonResult = Dict[str, List[Dict[str, Union[str, List[str]]]]]


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    # Parse user command line arguments
    parser = argparse.ArgumentParser(
        description="Clean an AWS ECR repository of all images/tags except those listed",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--profile", help="AWS user profile to use to connect to AWS ECR")
    parser.add_argument("--untagged", action="store_true", help="Delete untagged images.")
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


def run_aws_cmd(aws_cmd: List[str], verbose: bool = False) -> subprocess.CompletedProcess[str]:
    """Run an AWS command and print the command and results if verbose is set."""
    if verbose:
        print(aws_cmd)
    try:
        aws_results = subprocess.run(
            aws_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            check=True,
        )
        if verbose:
            result_fragments = aws_results.stdout.split("\\n")
            for fragment in result_fragments:
                if fragment == result_fragments[0]:
                    print(f"stdout: {fragment}")
                else:
                    print(f"\t{fragment}")
            print(f"stderr: {aws_results.stderr}")
        return aws_results

    except subprocess.CalledProcessError as err:
        print(f"CalledProcessError returned {err.returncode}")
        print(f"stdout: {err.stdout}")
        print(f"stderr: {err.stderr}")
        sys.exit(err.returncode)


def build_aws_cmd(
    profile: Optional[str], repo: str, subcommand: str, aws_args: Optional[List[str]] = None
) -> List[str]:
    """Build up an AWS ECR command from a subcommand and optional parts."""
    aws_cmd = ["aws", "ecr"]
    if profile:
        aws_cmd.append(f"--profile={profile}")
    aws_cmd.extend([f"--repository-name={repo}", "--output=json", subcommand])
    if aws_args:
        aws_cmd.extend(aws_args)
    return aws_cmd


def main() -> None:
    """Clean out old images in the AWS ECR repository."""
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

    # Create a list of image ids (tags or digest) that are not on our list
    # of tags to keep
    image_ids: List[str] = []

    # Iterate over image descriptions returned by AWS
    for image_struct in repo_images["imageDetails"]:
        # check to see if each tag should be kept
        # untagged images are left alone.
        if "imageTags" in image_struct:
            for tag in image_struct["imageTags"]:
                # check to see if there are patterns to test
                if not (keep_pattern and re.match(keep_pattern, tag)):
                    # now check to see if it matches any exact tags specified
                    if not args.keep or tag not in args.keep:
                        # 'latest' is a special tag - always points to most recent
                        # untagged image.  Delete this image by digest name but only
                        # if untagged images are to be deleted
                        if tag == "latest":
                            if args.untagged:
                                image_ids.append(f"imageDigest={image_struct['imageDigest']}")
                        else:
                            image_ids.append(f"imageTag={tag}")
        else:
            # No tags exist for this image
            if args.untagged:
                image_ids.append(f'imageDigest={image_struct["imageDigest"]}')
    # Remove all the specified image(s) in blocks of 100 (AWS limit)
    # See https://docs.aws.amazon.com/AmazonECR/latest/APIReference/API_BatchDeleteImage.html
    if len(image_ids) > 0:
        aws_delete_limit = 100
        for i in range(0, len(image_ids), aws_delete_limit):
            aws_cmd = build_aws_cmd(
                args.profile,
                args.repo,
                "batch-delete-image",
                ["--image-ids"] + image_ids[i : i + aws_delete_limit],
            )
            if args.dry_run:
                print(f"AWS Command: {aws_cmd}")
            else:
                run_aws_cmd(aws_cmd, args.verbose)
    elif args.verbose:
        print("No images/tags were deleted.")


if __name__ == "__main__":
    main()
