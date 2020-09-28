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
        help="Docker image repository to be cleaned."
    )
    parser.add_argument(
        "--keep",
        nargs='+',
        help="list of tags to keep",
    )
    parser.add_argument(
        "--dryrun",
        action="store_true",
        help="print delete command that would be run instead of executing it"
    )
    return parser.parse_args()

def runAwsCmd(profile, repo, subcommand, awsArgs=None, dryRun=False):
    awsCmd = [ "aws", "ecr" ]
    if profile:
        awsCmd.append("--profile="+profile[0])
    awsCmd.extend(["--repository-name="+repo[0], "--output=json", subcommand])
    if awsArgs:
        awsCmd.extend(awsArgs)

    if dryRun:
        print (awsCmd)
        return None
    else:
        return subprocess.run(awsCmd,
                              stdout=subprocess.PIPE,
                              stderr=subprocess.PIPE,
                              universal_newlines=True)


def main() -> None:
    args = parse_args()

    # get a list of the current image tags for the specified repo
    awsResult = runAwsCmd(args.profile, args.repo, "describe-images")


    # create a list of tags that are not on our list of tags to keep
    oldTags = []
    repoImages = json.loads(awsResult.stdout)

    # initialize list of images to be removed
    imageIds = ["--image-ids"]

    # iterate of image descriptions returned by AWS
    for imageStruct in repoImages['imageDetails']:
        # if there are image:tags to keep, find the tags to remove
        if args.keep != None:
            # build list of imageTags to be removed and remove them
            for tag in imageStruct['imageTags']:
                if tag not in args.keep:
                    oldTags.append(tag)
            # convert the list of tags to a set of image-ids for the AWS ECR command
            if len(oldTags) > 0:
                for tag in oldTags:
                    imageIds.append("imageTag="+tag)
        # if there are no image:tags to keep, remove the image digest
        else:
            # remove all images
            imageIds.append("imageDigest="+imageStruct['imageDigest'])

    # Remove all the specified image(s)
    if len(imageIds) > 1:
        awsResult = runAwsCmd(args.profile, args.repo, "batch-delete-image", imageIds, args.dryrun)
        if awsResult != None:
            print("Results: ", awsResult.stdout)
            print("STDERR: ", awsResult.stderr)
    else:
        print("No images/tags were deleted.")
# Standard boilerplate to call main().
if __name__ == '__main__':
    main()
