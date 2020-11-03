"""Collection of functions for managing Amazon Web Services."""
import os
from pathlib import Path

from utils import lookup_env


def aws_s3_put(src: Path, dest: str) -> bool:
    """Push a file to the configured AWS S3 Bucket."""
    aws_s3_bucket = lookup_env("AWS_S3_CERT_BUCKET")
    aws_s3_profile = lookup_env("AWS_S3_PROFILE")
    aws_s3_uri = f"s3://{aws_s3_bucket}/{dest}"
    print(f"AWS S3 put {src} to {dest}")
    return os.system(f"aws s3 cp --profile {aws_s3_profile} {src} {aws_s3_uri}") == 0


def aws_s3_get(src: str, dest: Path) -> bool:
    """Get a file from the configured AWS S3 Bucket."""
    aws_s3_bucket = lookup_env("AWS_S3_CERT_BUCKET")
    aws_s3_profile = lookup_env("AWS_S3_PROFILE")
    aws_s3_uri = f"s3://{aws_s3_bucket}/{src}"
    print(f"AWS S3 get {dest} from {src}")
    return os.system(f"aws s3 cp --profile {aws_s3_profile} {aws_s3_uri} {dest}") == 0
