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

import base64
from datetime import datetime, timedelta, timezone
import os
from pathlib import Path
import tempfile

from OpenSSL import crypto
from aws_backup import AwsBackup
from dateutil import parser as date_parser
from kubernetes import client, config
from maint_utils import run_cmd
import requests


class CertUpdater:
    """
    Check if the SSL Certificate needs to be updated and update if necessary.

    The CertUpdater is configured through the following environment variables:
      CERT_SECRET:  The Kubernetes name of the secret to be updated
      CERT_NAMESPACE: The Kubernetes namespace where the secret is located.
      CERT_RENEW_BEFORE: The minimum number of hours left on a certificate before it
        should be renewed.
      TEST_URL: A URL to use to test if we can reach the internet.
      AWS_S3_BUCKET: AWS S3 Bucket where the certificates are stored.
    """

    def __init__(self) -> None:
        self.cert_secret = os.environ["CERT_SECRET"]
        self.namespace = os.environ["CERT_NAMESPACE"]
        self.renew_before = timedelta(days=int(os.environ["CERT_RENEW_BEFORE"]))
        self.test_url = os.environ["TEST_URL"]
        self.aws = AwsBackup(bucket=os.environ["AWS_S3_BUCKET"])
        if "KUBECONFIG" in os.environ:
            self.k8s_config = config.load_kube_config()
        else:
            self.k8s_config = config.load_incluster_config()
        if "VERBOSE" in os.environ:
            self.verbose = bool(os.environ["VERBOSE"])
        else:
            self.verbose = False
        self.core_api = client.CoreV1Api()

    def log(self, message: str) -> None:
        if self.verbose:
            print(message)

    def is_reachable(self, *, redirects: bool = True) -> bool:
        """
        Test if a web site is reachable.

        Args:
            redirects: specifies if redirects are allowed.

        """
        try:
            resp = requests.get(self.test_url, allow_redirects=redirects)
        except requests.ConnectionError:
            self.log("No internet connection detected.")
            return False
        else:
            if resp.status_code in (200, 301):
                self.log(f"{resp.status_code} received from {self.test_url}")
                return True
            self.log("No internet connection detected.")
            return False

    def needs_renewal(self) -> bool:
        """Test to see if we need a new secret from AWS S3."""
        # 1. Read our current secret
        try:
            ssl_cert = self.core_api.read_namespaced_secret(self.cert_secret, self.namespace)
        except client.exceptions.ApiException:
            return True
        cert_data = base64.b64decode(ssl_cert.data["tls.crt"])
        cert = crypto.load_certificate(crypto.FILETYPE_PEM, cert_data)
        # 2. Lookup the expiration date
        expiration_str = cert.get_notAfter()
        if expiration_str is None:
            return True
        expiration_date = date_parser.parse(expiration_str)
        expires_in = expiration_date - datetime.now(timezone.utc)
        self.log(f"Certificate expires on {expiration_date} ({expires_in} from now).")
        if expires_in < self.renew_before:
            return True
        return False

    def pull_cert(self) -> None:
        self.log(f"Updating {self.cert_secret} from AWS.")
        with tempfile.TemporaryDirectory() as temp_dir:
            for filename in ("cert.pem", "key.pem"):
                self.log(f"Pull {self.cert_secret}/{filename} from AWS S3")
                secret_filename = Path(temp_dir) / filename
                self.aws.pull(f"{self.cert_secret}/{filename}", secret_filename)
            # We could use the kubernetes module but since this image already has
            # kubectl, it is easier to just use that
            # First, delete the old secret
            run_cmd(
                [
                    "kubectl",
                    "-n",
                    self.namespace,
                    "delete",
                    "secret",
                    self.cert_secret,
                    "--ignore-not-found",
                ]
            )
            key_file = Path(temp_dir) / "key.pem"
            cert_file = Path(temp_dir) / "cert.pem"
            run_cmd(
                [
                    "kubectl",
                    "-n",
                    self.namespace,
                    "create",
                    "secret",
                    "tls",
                    self.cert_secret,
                    "--key",
                    str(key_file),
                    "--cert",
                    str(cert_file),
                ]
            )


if __name__ == "__main__":
    updater = CertUpdater()
    if updater.needs_renewal() and updater.is_reachable():
        updater.pull_cert()
