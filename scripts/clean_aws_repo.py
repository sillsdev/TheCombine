#!/usr/bin/env python

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
from datetime import datetime
import json
import os
import re
import subprocess
import sys
import textwrap
from typing import Dict, List, Optional, Set, TypedDict


# Type definition for results from AWS "describe-images"
class ImageDetail(TypedDict, total=False):
    imageDigest: str  # noqa: N815
    imagePushedAt: str  # noqa: N815
    imageTags: List[str]  # noqa: N815


AwsJsonResult = Dict[str, List[ImageDetail]]


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
        Examples:

        {os.path.basename(__file__)} repo_a repo_b --remove "0\\.1\\.\\d" --keep "0\\.1\\.20"

        will delete from repo_a and repo_b all images with a 0.1.* tag but no 0.1.20 tag.

        {os.path.basename(__file__)} repo_a --untagged --list

        will list all untagged images in repo_a.

        Notes:

         - The repo names must be specified BEFORE the --keep and --remove options.
         - If both deletion options (--remove and --untagged) are specified, both will be applied.
         - If no deletion option is specified, this is the same behavior as specifying '--list'.
         - If '--list' is specified with a deletion option,
           relevant images will be listed and NOT deleted.
         - For safety, any image with the 'latest' tag will not be deleted.

        """,
        formatter_class=RawFormatter,
    )
    parser.add_argument("--profile", help="AWS user profile to use to connect to AWS ECR")
    parser.add_argument("--untagged", action="store_true", help="Delete untagged images")
    parser.add_argument(
        "repo_list",
        nargs="+",
        help="Docker image repository to be cleaned. (Multiple repos may be listed.)",
        metavar="repo",
    )
    parser.add_argument(
        "--keep",
        nargs="+",
        help="List of regular expressions for tags to keep (overriding deletion specification)",
    )
    parser.add_argument(
        "--list", action="store_true", help="List images in the repo. No images are deleted."
    )
    parser.add_argument(
        "--remove",
        dest="rm_pattern",
        nargs="+",
        help="List of regular expressions that specify tags to delete",
    )
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
    profile: Optional[str],
    repo: str,
    subcommand: str,
    aws_args: Optional[List[str]] = None,
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

    # Determine if we should list images instead of deleting them
    delete_images = bool(args.untagged or args.rm_pattern)
    list_images = args.list or not delete_images

    # Convert --keep and --remove lists each into single regex
    kp_pattern = f"^(?:{'|'.join(args.keep)})$" if args.keep else None
    rm_pattern = f"^(?:{'|'.join(args.rm_pattern)})$" if args.rm_pattern else None
    if args.verbose and kp_pattern:
        print(f"Keep pattern: {kp_pattern}")
    if args.verbose and rm_pattern:
        print(f"Remove pattern: {rm_pattern}")

    # Iterate over the list of repos
    for repo in args.repo_list:
        if args.verbose:
            print(f"Cleaning repo {repo}")
        # Get a list of the current images for the specified repo
        aws_cmd = build_aws_cmd(args.profile, repo, "describe-images")
        aws_result = run_aws_cmd(aws_cmd, args.verbose)

        # Load the JSON output of the describe-images command into a 'repo_images' dictionary
        repo_images: AwsJsonResult = json.loads(aws_result.stdout)

        # Set of image ids for deletion
        image_id_set: Set[str] = set()

        # Iterate over image descriptions returned by AWS
        for image_struct in repo_images["imageDetails"]:
            digest_id = f'imageDigest={image_struct["imageDigest"]}'
            tag_list = image_struct.get("imageTags", [])

            # Create image info string for printing
            list_str = ""
            if list_images:
                list_str = f"{digest_id}"
                if "imagePushedAt" in image_struct:
                    pushed_at = datetime.fromisoformat(image_struct["imagePushedAt"])
                    list_str += f"\n  created: {pushed_at}"
                if tag_list:
                    list_str += f"\n  tags: {', '.join(tag_list)}"

            # If there is no deletion specification, then just print
            if not delete_images:
                print(list_str)
                continue

            # Always skip 'latest' tagged image
            if "latest" in tag_list:
                if args.verbose:
                    print(f"Skipping image {digest_id} because it has the 'latest' tag.")
                continue

            # Skip images with tags that match the --keep patterns
            if kp_pattern and any(re.match(kp_pattern, tag) for tag in tag_list):
                if args.verbose:
                    print(f"Skipping image {digest_id} because it has a --keep tag.")
                continue

            # Check if image matches deletion specification
            if (args.untagged and not tag_list) or (
                rm_pattern and any(re.match(rm_pattern, tag) for tag in tag_list)
            ):
                if args.list:
                    print(list_str)
                else:
                    image_id_set.add(digest_id)

        if not list_images:
            # Delete all the specified image(s) in blocks of 100 (AWS limit)
            # See:
            # https://docs.aws.amazon.com/AmazonECR/latest/APIReference/API_BatchDeleteImage.html
            if image_id_set:
                image_ids = list(image_id_set)
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
