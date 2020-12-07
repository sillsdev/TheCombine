"""Collection of functions for managing Amazon Web Services."""
import os
from pathlib import Path
from typing import List

from utils import get_setting


def aws_s3_put(src: Path, dest: str) -> bool:
    """
    Push a file to the configured AWS S3 Bucket.

    NOTE: "dest" needs to be relative to the certs folder in the AWS bucket
    that is configured for the container.  aws_s3_put will add the bucket
    information.
    """
    aws_s3_bucket = get_setting("AWS_S3_CERT_LOC")
    aws_s3_profile = get_setting("AWS_S3_PROFILE")
    aws_s3_uri = f"s3://{aws_s3_bucket}/{dest}"
    print(f"AWS S3 put {src} to {dest}")
    return os.system(f"aws s3 cp --profile {aws_s3_profile} {src} {aws_s3_uri}") == 0


def aws_s3_get(src: str, dest: Path) -> bool:
    """
    Get a file from the configured AWS S3 Bucket.

    NOTE: "src" needs to be relative to the certs folder in the AWS bucket
    that is configured for the container.  aws_s3_get will add the bucket
    information.
    """
    aws_s3_bucket = get_setting("AWS_S3_CERT_LOC")
    aws_s3_profile = get_setting("AWS_S3_PROFILE")
    aws_s3_uri = f"s3://{aws_s3_bucket}/{src}"
    print(f"AWS S3 get {dest} from {src}")
    return os.system(f"aws s3 cp --profile {aws_s3_profile} {aws_s3_uri} {dest}") == 0


def aws_push_certs() -> None:
    """Push all proxy certificates to AWS S3."""
    cert_file_list = ("cert.pem", "chain.pem", "fullchain.pem", "privkey.pem")
    domain_list: List[str] = get_setting("CERT_PROXY_DOMAINS").split()
    for domain in domain_list:
        cert_dir = Path(f"/etc/letsencrypt/live/{domain}")
        for cert_file in cert_file_list:
            aws_s3_put(Path(f"{cert_dir}/{cert_file}"), f"{domain}/{cert_file}")
