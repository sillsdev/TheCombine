"""Collection of functions for managing Amazon Web Services."""
from pathlib import Path
import subprocess
from typing import Tuple

from letsencrypt_cert import LetsEncryptCert
from utils import get_setting


def _get_aws_uri_(obj: str) -> Tuple[str, str]:
    """
    Lookup the URI for an AWS S3 object and the profile for accessing it.

    Lookup the AWS S3 URI and the profile for accessing it.  Returns the
    values as a Tuple (aws_s3_uri, aws_profile)
    """
    aws_bucket = get_setting("AWS_S3_CERT_LOC")
    aws_profile = get_setting("AWS_S3_PROFILE")
    return f"s3://{aws_bucket}/{obj}", aws_profile


def aws_s3_put(src: Path, dest: str) -> None:
    """
    Push a file to the configured AWS S3 Bucket.

    NOTE: "dest" needs to be relative to the certs folder in the AWS bucket
    that is configured for the container.  aws_s3_put will add the bucket
    information.
    """
    aws_s3_uri, aws_s3_profile = _get_aws_uri_(dest)
    if aws_s3_profile:
        aws_cmd = f"aws s3 cp --profile {aws_s3_profile} {src} {aws_s3_uri}"
    else:
        aws_cmd = f"aws s3 cp {src} {aws_s3_uri}"
    subprocess.call(aws_cmd, shell=True)


def aws_s3_get(src: str, dest: Path) -> bool:
    """
    Get a file from the configured AWS S3 Bucket.

    NOTE: "src" needs to be relative to the certs folder in the AWS bucket
    that is configured for the container.  aws_s3_get will add the bucket
    information.
    """
    aws_s3_uri, aws_s3_profile = _get_aws_uri_(src)
    if aws_s3_profile:
        aws_cmd = f"aws s3 cp --profile {aws_s3_profile} {aws_s3_uri} {dest}"
    else:
        aws_cmd = f"aws s3 cp {aws_s3_uri} {dest}"
    return subprocess.call(aws_cmd, shell=True) == 0


def aws_push_certs() -> None:
    """Push all proxy certificates to AWS S3."""
    cert_file_list = ("cert.pem", "chain.pem", "fullchain.pem", "privkey.pem")
    domain_list = get_setting("CERT_PROXY_DOMAINS").split()
    for domain in domain_list:
        cert_dir = Path(f"{LetsEncryptCert.LETSENCRYPT_DIR}/live/{domain}")
        for cert_file in cert_file_list:
            aws_s3_put(Path(f"{cert_dir}/{cert_file}"), f"{domain}/{cert_file}")
