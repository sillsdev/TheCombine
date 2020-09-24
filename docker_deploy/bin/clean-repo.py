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


def main() -> None:
    args = parse_args()

    print("Repo: ", args.repo)
    print("Profile: ", args.profile)
    print("Tags: ", args.keep_tag)

    awsEcrArgs = [ "aws", "ecr" ]
    if args.profile:
        awsEcrArgs.extend(["--profile="+args.profile[0]])
    awsEcrArgs.extend(["--repository-name="+args.repo[0], "--output=json", "describe-images"])

    print("Command: ", awsEcrArgs)

    awsResult=subprocess.run(awsEcrArgs,
                             stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE,
                             universal_newlines=True)
    # print("Results: ", awsResult.stdout)

    repoImages = json.loads(awsResult.stdout)
    print("Python struct: ", repoImages)
    print("len(repoImages) == ", len(repoImages))
    print("repoImages == ", type(repoImages).__name__)
    for imageStruct in repoImages:
        print("imageStruct == ", imageStruct.imageDetails)
        # for detailStruct in imageStruct.imageDetails:
        #     for tag in detailStruct.imageTags:
        #         print("found tag: ", tag)

# Standard boilerplate to call main().
if __name__ == '__main__':
    main()
