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
from datetime import datetime, timezone
import json
import os
import re
import subprocess
import sys
import textwrap
from typing import Dict, List, Optional, Set, TypedDict

from dateutil.relativedelta import relativedelta


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

        will remove from repo_a and repo_b all images with a 0.1.* tag but no 0.1.20 tag.

        {os.path.basename(__file__)} repo_a --months-old 6 --keep ".+" --list

        will list all untagged images from repo_a that were created more than 6 months ago.

        Notes:

         - The repo names must be specified BEFORE the --keep and --remove options.
         - The removal options (--remove, --untagged, and --months-old) are mutually exclusive.
         - If no removal option is specified, this is the same behavior as specifying '--list'.
         - If '--list' is specified with a removal option,
           relevant images will be listed and NOT removed.
         - For safety, any image with the 'latest' tag will not be removed.

        """,
        formatter_class=RawFormatter,
    )
    parser.add_argument("--profile", help="AWS user profile to use to connect to AWS ECR")
    parser.add_argument(
        "--public",
        action="store_true",
        help="Use Amazon ECR Public instead of private ECR",
    )
    parser.add_argument(
        "repo_list",
        nargs="+",
        help="Docker image repository to be cleaned. (Multiple repos may be listed.)",
        metavar="repo",
    )
    parser.add_argument(
        "--keep",
        nargs="+",
        help="List of regular expressions for tags to keep (overriding removal specification)",
    )
    parser.add_argument(
        "--list", action="store_true", help="List images in the repo. No images are removed."
    )
    removal_group = parser.add_mutually_exclusive_group()
    removal_group.add_argument(
        "--remove",
        dest="rm_pattern",
        nargs="+",
        help="List of regular expressions that specify tags to remove",
    )
    removal_group.add_argument("--untagged", action="store_true", help="Remove untagged images")
    removal_group.add_argument(
        "--months-old",
        type=int,
        help="Remove images older than the specified number of months",
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
    public: bool = False,
) -> List[str]:
    """Build up an AWS ECR command from a subcommand and optional parts."""
    aws_cmd = ["aws"]
    if public:
        aws_cmd.extend(["ecr-public", "--region=us-east-1"])
    else:
        aws_cmd.append("ecr")
    if profile:
        aws_cmd.append(f"--profile={profile}")
    aws_cmd.extend([f"--repository-name={repo}", "--output=json", subcommand])
    if aws_args:
        aws_cmd.extend(aws_args)
    return aws_cmd


def main() -> None:
    """Clean out old images in the AWS ECR repository."""
    args = parse_args()

    # Validate that --months-old is positive if specified
    if args.months_old is not None and args.months_old <= 0:
        print("'--months-old' must be greater than 0", file=sys.stderr)
        sys.exit(1)

    # Determine if we should list images instead of removing them
    rm_images = bool(args.rm_pattern or args.untagged or args.months_old)
    list_images = args.list or not rm_images

    # Convert --keep and --remove lists each into single regex
    kp_pattern = "^(?:%s)$" % "|".join(args.keep) if args.keep else None
    rm_pattern = "^(?:%s)$" % "|".join(args.rm_pattern) if args.rm_pattern else None
    if args.verbose and kp_pattern:
        print(f"Keep pattern: {kp_pattern}")
    if args.verbose and rm_pattern:
        print(f"Remove pattern: {rm_pattern}")

    # Compute cutoff datetime from --months-old
    cutoff_date: Optional[datetime] = None
    if args.months_old is not None:
        cutoff_date = datetime.now(timezone.utc) - relativedelta(months=args.months_old)
        if args.verbose:
            print(f"Cutoff date for removing images: {cutoff_date}")

    # Iterate over the list of repos
    for repo in args.repo_list:
        if args.verbose:
            print(f"Cleaning repo {repo}")
        # Get a list of the current images for the specified repo
        aws_cmd = build_aws_cmd(args.profile, repo, "describe-images", public=args.public)
        aws_result = run_aws_cmd(aws_cmd, args.verbose)

        # Load the JSON output of the describe-images command into a 'repo_images' dictionary
        repo_images: AwsJsonResult = json.loads(aws_result.stdout)

        # Set of image ids for deletion
        image_id_set: Set[str] = set()

        # Iterate over image descriptions returned by AWS
        for image_struct in repo_images["imageDetails"]:
            digest_id = f'imageDigest={image_struct["imageDigest"]}'
            tag_list = image_struct.get("imageTags", [])
            pushed_at: Optional[datetime] = None
            if (list_images or args.months_old) and "imagePushedAt" in image_struct:
                pushed_at_str = image_struct["imagePushedAt"].replace("Z", "+00:00")
                pushed_at = datetime.fromisoformat(pushed_at_str)

            # Create image info string for printing
            list_str = ""
            if list_images:
                list_str = f"{digest_id}"
                if pushed_at:
                    list_str += f"\n  created: {pushed_at}"
                if tag_list:
                    list_str += f"\n  tags: {', '.join(tag_list)}"

            # If there is no removal specification, then just print
            if not rm_images:
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

            # Check if image matches removal specification
            if (
                (rm_pattern and any(re.match(rm_pattern, tag) for tag in tag_list))
                or (args.untagged and not tag_list)
                or (cutoff_date and pushed_at and pushed_at < cutoff_date)
            ):
                if args.list:
                    print(list_str)
                else:
                    image_id_set.add(digest_id)

        if not list_images:
            # Remove all the specified image(s) in blocks of 100 (AWS limit)
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
                        args.public,
                    )
                    if args.dry_run:
                        print(f"AWS Command: {aws_cmd}")
                    else:
                        run_aws_cmd(aws_cmd, args.verbose)
            elif args.verbose:
                print("No images/tags were deleted.")


if __name__ == "__main__":
    main()
