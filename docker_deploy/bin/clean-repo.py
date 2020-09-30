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
import re

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
        "--keep-pattern",
        dest='keep_pattern',
        nargs='+',
        help="list of regular expressions that specify tags to keep"
    )
    # Add some debugging options to see what's going on
    parser.add_argument(
        "--dry-run",
        dest='dry_run',
        action="store_true",
        help="print delete command that would be run instead of executing it"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="print intermediate values to aid in debugging"
    )
    return parser.parse_args()

def runAwsCmd(awsCmd, verbose=False, dry_run=False):
    if dry_run or verbose:
        print (awsCmd)
    if dry_run:
        return None
    else:
        awsResults = subprocess.run(awsCmd,
                                    stdout=subprocess.PIPE,
                                    stderr=subprocess.PIPE,
                                    universal_newlines=True)
        if verbose:
            print(awsResults)
        return awsResults

def buildAwsCommand(profile, repo, subcommand, awsArgs=None):
    awsCmd = [ "aws", "ecr" ]
    if profile:
        awsCmd.append("--profile="+profile[0])
    awsCmd.extend(["--repository-name="+repo[0], "--output=json", subcommand])
    if awsArgs:
        awsCmd.extend(awsArgs)
    return awsCmd

def main() -> None:
    args = parse_args()

    # get a list of the current image tags for the specified repo
    awsCmd = buildAwsCommand(args.profile, args.repo, "describe-images")
    awsResult = runAwsCmd(awsCmd, args.verbose)

    # create a list of tags that are not on our list of tags to keep
    oldTags = []

    # load the JSON output of the describe-images command into a 'repoImages'
    # dictionary
    repoImages = json.loads(awsResult.stdout)

    # initialize list of images to be removed with the option name for the
    # aws ecr command
    image_ids = ["--image-ids"]

    # join patterns of tags to keep to a single regular expression
    keep_pattern = ''
    if args.keep_pattern != None:
        keep_pattern = '^(?:% s)$' % '|'.join(args.keep_pattern)
        if args.verbose:
            print("keep_pattern: ", keep_pattern)

    # iterate over image descriptions returned by AWS
    for imageStruct in repoImages['imageDetails']:
        # check to see if each tag should be kept
        for tag in imageStruct['imageTags']:
            if args.verbose:
                print("Testing tag: ", tag, " from ", imageStruct['imagePushedAt'])
            # check to see if there are patterns to test
            if len(keep_pattern) > 0 and not re.match(keep_pattern, tag):
                # now check to see if it matches any exact tags specified
                if args.keep != None and tag not in args.keep:
                    oldTags.append(tag)

    # Remove all the specified image(s)
    if len(oldTags) > 0:
    # convert the list of tags to a set of image-ids for the AWS ECR command
        for tag in oldTags:
            image_ids.append("imageTag="+tag)
        awsCmd = buildAwsCommand(args.profile, args.repo, "batch-delete-image", image_ids)
        awsResult = runAwsCmd(awsCmd, args.verbose, args.dry_run)
    elif args.verbose:
        print("No images/tags were deleted.")
# Standard boilerplate to call main().
if __name__ == '__main__':
    main()
