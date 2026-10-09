#!/usr/bin/env python3
"""
Check the expiration time of the TLS secret and update if needed.

check_cert.py will update the current certificate for the NUC from the secret stored
in the AWS_S3_BUCKET. It will update the certificate if all of the following
conditions are met:
 - the NUC is connected to the Internet;
 - less than CERT_RENEW_BEFORE_PERCENTAGE percent of the current certificate's
   lifetime remains, or the certificate (defined by CERT_SECRET) does not exist;
 - the certificate in AWS S3 expires later than the current certificate.
"""

import base64
from datetime import datetime, timezone
import os
from pathlib import Path
import tempfile
from typing import Optional, Tuple

from OpenSSL import crypto
from aws_backup import AwsBackup
from dateutil import parser as date_parser
from kubernetes import client, config
from maint_utils import run_cmd
import requests


def get_validity(cert_data: bytes) -> Tuple[datetime, datetime]:
    """Return the start and end of the validity period of a PEM certificate."""
    cert = crypto.load_certificate(crypto.FILETYPE_PEM, cert_data)
    not_before = cert.get_notBefore()
    not_after = cert.get_notAfter()
    if not_before is None or not_after is None:
        raise ValueError("Certificate is missing its validity period.")
    return date_parser.parse(not_before), date_parser.parse(not_after)


class CertUpdater:
    """
    Check if the SSL Certificate needs to be updated and update if necessary.

    The CertUpdater is configured through the following environment variables:
      CERT_SECRET: The Kubernetes name of the secret to be updated
      CERT_NAMESPACE: The Kubernetes namespace where the secret is located.
      CERT_RENEW_BEFORE_PERCENTAGE: The percentage of a certificate's lifetime left
        when it should be renewed.
      TEST_URL: A URL to use to test if we can reach the internet.
      AWS_S3_BUCKET: AWS S3 Bucket where the certificates are stored.
    """

    def __init__(self) -> None:
        self.cert_secret = os.environ["CERT_SECRET"]
        self.namespace = os.environ["CERT_NAMESPACE"]
        self.renew_before_percentage = float(os.environ["CERT_RENEW_BEFORE_PERCENTAGE"])
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
        self.current_expiration: Optional[datetime] = None

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
        # 2. Lookup the validity period
        try:
            not_before, not_after = get_validity(base64.b64decode(ssl_cert.data["tls.crt"]))
        except ValueError:
            return True
        self.current_expiration = not_after
        expires_in = not_after - datetime.now(timezone.utc)
        self.log(f"Certificate expires on {not_after} ({expires_in} from now).")
        return expires_in * 100 < (not_after - not_before) * self.renew_before_percentage

    def pull_cert(self) -> None:
        self.log(f"Updating {self.cert_secret} from AWS.")
        with tempfile.TemporaryDirectory() as temp_dir:
            key_file = Path(temp_dir) / "key.pem"
            cert_file = Path(temp_dir) / "cert.pem"
            self.log(f"Pull {self.cert_secret}/cert.pem from AWS S3")
            self.aws.pull(f"{self.cert_secret}/cert.pem", cert_file)
            _, new_expiration = get_validity(cert_file.read_bytes())
            if self.current_expiration is not None and new_expiration <= self.current_expiration:
                self.log(f"Certificate in AWS S3 expires on {new_expiration}; not replacing.")
                return
            self.log(f"Pull {self.cert_secret}/key.pem from AWS S3")
            self.aws.pull(f"{self.cert_secret}/key.pem", key_file)
            # We could use the kubernetes module but since this image already has
            # kubectl, it is easier to just use that.
            # The secret is applied in place so that it is never missing.
            secret_yaml = run_cmd(
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
                    "--dry-run=client",
                    "-o",
                    "yaml",
                ]
            ).stdout
            run_cmd(["kubectl", "-n", self.namespace, "apply", "-f", "-"], stdin_text=secret_yaml)


if __name__ == "__main__":
    updater = CertUpdater()
    if updater.needs_renewal() and updater.is_reachable():
        updater.pull_cert()
