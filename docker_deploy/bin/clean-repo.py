#!/usr/bin/env python3

"""
This script cleans out old docker images from the AWS ECR repository

Assumptions:
  1. aws-cli is installed (see https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
  2. aws-cli has been configured with the access keys required to read/write to the
     specified repository
"""

import argparse
import json
import os
import subprocess

def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Clean an AWS ECR repository of all images/tags except those listed",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--profile",
        nargs=1,
        help="AWS user profile to use to connect to AWS ECR"
    )
    parser.add_argument(
        "repo",
        nargs=1,
        help="specify the repo to be cleaned."
    )
    parser.add_argument(
        "keep_tag",
        nargs='+',
        help="list of tags to keep",
    )
    return parser.parse_args()

def runAwsCmd(profile, repo, subcommand, awsArgs=None):
    awsCmd = [ "aws", "ecr" ]
    if profile:
        awsCmd.append("--profile="+profile)
    awsCmd.extend(["--repository-name="+repo, "--output=json", subcommand])
    if awsArgs:
        awsCmd.extend(awsArgs)

    return subprocess.run(awsCmd,
                         stdout=subprocess.PIPE,
                         stderr=subprocess.PIPE,
                         universal_newlines=True)


def main() -> None:
    args = parse_args()

    # get a list of the current image tags for the specified repo
    awsResult = runAwsCmd(args.profile[0], args.repo[0], "describe-images")


    # create a list of tags that are not on our list of tags to keep
    oldTags = []
    repoImages = json.loads(awsResult.stdout)

    for imageStruct in repoImages['imageDetails']:
        for tag in imageStruct['imageTags']:
            if tag not in args.keep_tag:
                oldTags.append(tag)

    # convert the list of tags to a set of image-ids for the AWS ECR command
    if len(oldTags) > 0:
        imageIds = ["--image-ids"]
        for tag in oldTags:
            imageIds.append("imageTag="+tag)

        # Remove all the obsolete tags
        awsResult = runAwsCmd(args.profile[0], args.repo[0], "batch-delete-image", imageIds)
        print("Results: ", awsResult.stdout)
        print("STDERR: ", awsResult.stderr)

# Standard boilerplate to call main().
if __name__ == '__main__':
    main()
