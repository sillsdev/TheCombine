#!/usr/bin/env python3
"""
Monitor TLS secrets for changes and push changes to AWS S3.

monitor.py will monitor the secrets specified in the CERT_PROXY_CERTIFICATES
environment variable.  When a secret is updated, the updated secret is pushed
to the AWS_S3_BUCKET.
"""

import base64
import os
from pathlib import Path
import tempfile
from typing import List

from aws_backup import AwsBackup
from kubernetes import client, config, watch


class CertMonitor:
    """
    Monitor SSL certificate secrets and push a copy to the cloud on change.

    Attributes:
        secrets_list: A list of Kubernetes secrets that to be monitored for
            changes.

        k8s_namespace: Kubernetes namespace where the secrets are located.

        trigger_events: A tuple of events that are returned by the watch that will
            trigger an update of the certificate in AWS S3.

        aws: An instance of AwsBackup to push any updated certificates to AWS S3
            storage.
    """

    trigger_events = ("ADDED", "MODIFIED")

    def __init__(self) -> None:
        self.secrets_list = CertMonitor.get_secrets_list()
        self.k8s_namespace = os.environ["CERT_PROXY_NAMESPACE"]
        self.aws = AwsBackup(bucket=os.environ["AWS_S3_BUCKET"])

    @staticmethod
    def get_secrets_list() -> List[str]:
        """
        Create the list of secrets to monitor.

        Create the list of secrets to monitor from the CERT_PROXY_CERTIFICATES
        environment variable.  This function assumes that the secret name is '-tls'
        appended to the dns name of the server (with '.' converted to '-').
        """
        if "CERT_PROXY_CERTIFICATES" in os.environ:
            domain_list = os.environ["CERT_PROXY_CERTIFICATES"].replace(".", "-").split()
            for index, item in enumerate(domain_list):
                domain_list[index] = f"{item}-tls"
            return domain_list
        return []

    def push_secret_file(self, *, secret_name: str, data: bytes, filename: str) -> None:
        """
        Push single file associated with the TLS secret to AWS S3 storage.

        Args:
            secret_name: name of the secret that is being pushed to AWS S3.

            data: contents of the file to be pushed.

            filename: name of the file.

        Example:
            push_secret_file(
                secret_name="my-cert-tls",
                data=b'<my cert data>',
                filename="cert.pem")
            will create a file that contains the data received in the AWS
            S3 bucket under my-cert-tls/cert.pem.
        """
        secret_dest = f"{secret_name}/{filename}"
        print(f"Push {secret_dest} to AWS S3", flush=True)
        with tempfile.TemporaryDirectory() as temp_dir:
            secret_dir = Path(temp_dir) / secret_name
            secret_dir.mkdir(parents=True, exist_ok=True)
            secret_filename = secret_dir / filename
            secret_filename.write_bytes(data)
            self.aws.push(secret_filename, f"{secret_dest}")

    def monitor(self) -> None:
        """Monitor for updates to the secrets."""
        # Setup watch on Kubernetes secrets
        config.load_incluster_config()
        core_api = client.CoreV1Api()
        # Create watch object
        watch_obj = watch.Watch()
        # Wait for events
        for event in watch_obj.stream(
            core_api.list_namespaced_secret, namespace=self.k8s_namespace
        ):
            secret_name = event["object"].metadata.name
            event_type = event["type"]
            print(f"Event: {event_type} {secret_name}", flush=True)
            if (event_type in CertMonitor.trigger_events) and (secret_name in self.secrets_list):
                self.push_secret_file(
                    secret_name=secret_name,
                    data=base64.b64decode(event["object"].data["tls.key"]),
                    filename="key.pem",
                )
                self.push_secret_file(
                    secret_name=secret_name,
                    data=base64.b64decode(event["object"].data["tls.crt"]),
                    filename="cert.pem",
                )


def main() -> None:
    cert_monitor = CertMonitor()
    cert_monitor.monitor()


if __name__ == "__main__":
    main()
