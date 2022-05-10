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

from argparse import ArgumentParser, HelpFormatter, Namespace
import json
import os
import re
import subprocess
import sys
import textwrap
from typing import Dict, List, Optional, Union

# Type definitions for results from AWS "describe-images"
AwsJsonResult = Dict[str, List[Dict[str, Union[str, List[str]]]]]


class RawFormatter(HelpFormatter):
    """
    Allow new lines in help text.

    see https://stackoverflow.com/questions/3853722/how-to-insert-newlines-on-argparse-help-text
    """

    def _fill_text(self, text, width, indent):  # type: ignore
        """Strip the indent from the original python definition that plagues most of us."""
        text = textwrap.dedent(text)
        text = textwrap.indent(text, indent)  # Apply any requested indent.
        text = text.splitlines()  # Make a list of lines
        text = [textwrap.fill(line, width) for line in text]  # Wrap each line
        text = "\n".join(text)  # Join the lines again
        return str(text)


def parse_args() -> Namespace:
    """Define command line arguments for parser."""
    # Parse user command line arguments
    parser = ArgumentParser(
        description="Clean an AWS ECR repository of specified images/tags",
        epilog=f"""
        Example:

        {os.path.basename(__file__)} repo_a repo_b --remove "0\\.1\\.\\d" --keep "0\\.1\\.20"

        will remove all tags for the 0.1.* releases except 0.1.20 from repos
        repo_a and repo_b.

        Notes:

         - The repo names must be specified BEFORE the --remove or --keep options.
         - If neither --untagged nor --remove options is specified, then
           {os.path.basename(__file__)} will list the images.  This is the same
           behavior as specifying '--list'.

        """,
        formatter_class=RawFormatter,
    )
    parser.add_argument("--profile", help="AWS user profile to use to connect to AWS ECR")
    parser.add_argument("--untagged", action="store_true", help="Delete untagged images.")
    parser.add_argument(
        "repo_list",
        nargs="+",
        help="Docker image repository to be cleaned. (Multiple repos may be listed.)",
        metavar="repo",
    )
    parser.add_argument(
        "--keep",
        nargs="+",
        help="List of tags to keep that would otherwise be removed",
    )
    parser.add_argument(
        "--list", action="store_true", help="List images in the repo.  No images are deleted."
    )
    parser.add_argument(
        "--remove",
        dest="rm_pattern",
        nargs="+",
        help="List of regular expressions that specify tags to remove",
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

    # Verify that either '--untagged' or '--remove' or '--list' are specified
    list_images = args.list or (
        not args.untagged and (args.rm_pattern is None or len(args.rm_pattern) == 0)
    )

    rm_pattern: Optional[str] = None
    if args.rm_pattern is not None:
        # Join patterns of tags to keep to a single regular expression
        rm_pattern = "^(?:% s)$" % "|".join(args.rm_pattern)

    # Iterate over the list of repos
    for repo in args.repo_list:
        if args.verbose:
            print(f"Cleaning repo {repo}")
        # Get a list of the current image tags for the specified repo
        aws_cmd = build_aws_cmd(args.profile, repo, "describe-images")
        aws_result = run_aws_cmd(aws_cmd, args.verbose)

        # Load the JSON output of the describe-images command into a 'repo_images'
        # dictionary
        repo_images: AwsJsonResult = json.loads(aws_result.stdout)

        # Create a list of image ids (tags or digest) to be deleted.
        image_ids: List[str] = []

        # Iterate over image descriptions returned by AWS
        for image_struct in repo_images["imageDetails"]:
            # check to see if each tag should be kept
            # untagged images are left alone.
            if "imageTags" in image_struct:
                for tag in image_struct["imageTags"]:
                    # 'latest' is a special tag - always points to most recent
                    # untagged image.  Delete this image by digest name but only
                    # if untagged images are to be deleted
                    if list_images:
                        print(f"tag {tag}")
                    if tag == "latest":
                        if args.untagged:
                            image_ids.append(f"imageDigest={image_struct['imageDigest']}")
                    # if not "latest", check to see if there are patterns to test
                    elif rm_pattern is not None and re.match(rm_pattern, tag):
                        # now check to see if it matches any exact tags specified
                        if not args.keep or tag not in args.keep:
                            image_ids.append(f"imageTag={tag}")
            else:
                # No tags exist for this image
                if args.untagged:
                    image_ids.append(f'imageDigest={image_struct["imageDigest"]}')
                if list_images:
                    print(f'digest {image_struct["imageDigest"]}')
        if not list_images:
            # Remove all the specified image(s) in blocks of 100 (AWS limit)
            # See:
            # https://docs.aws.amazon.com/AmazonECR/latest/APIReference/API_BatchDeleteImage.html
            if len(image_ids) > 0:
                aws_delete_limit = 100
                for i in range(0, len(image_ids), aws_delete_limit):
                    aws_cmd = build_aws_cmd(
                        args.profile,
                        repo,
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
