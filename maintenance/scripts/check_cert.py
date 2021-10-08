#!/usr/bin/env python3
"""
Check the expiration time of the TLS secret and update if needed.

check_cert.py will update the current certificate for the NUC from the secret stored
in the AWS_S3_BUCKET.  It will update the certificate under the following
conditions:
 - the NUC is connected to the Internet
 - there are less than CERT_RENEW_BEFORE_EXPIRY days left on the current
   certificate
 - the certificate (defined by CERT_SECRET) does not exist
"""

import os

import requests
from aws_backup import AwsBackup
from kubernetes import client, config, watch


def is_reachable(url: str, *, redirects: bool = True) -> bool:
    """
    Test if a web site is reachable.

    Args:
        url: the URL to be tested
        redirects: a boolean value that specifies if redirects are allowed.

    """
    try:
        resp = requests.get(url, allow_redirects=redirects)
    except requests.ConnectionError:
        return False
    else:
        if resp.status_code in (200, 301):
            return True
        return False


def needs_renewal(secret_name: str) -> bool:
    # First test to see if we have an internet connection
    if not is_reachable("https://aws.amazon.com/"):
        return False
    config.load_incluster_config()
    v1 = client.CoreV1Api()
    return True


def update_cert(cert_secret: str) -> None:
    aws = AwsBackup(bucket=os.environ["AWS_S3_BUCKET"])
    print(f"Updating {cert_secret}")


def main() -> None:
    cert_secret = os.environ["CERT_SECRET"]
    test_url = os.environ["TEST_URL"]
    if needs_renewal(cert_secret) and is_reachable(test_url):
        update_cert(cert_secret)


if __name__ == "__main__":
    main()
