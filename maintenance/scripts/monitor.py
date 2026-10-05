#!/usr/bin/env python3
"""
Monitor TLS secrets for changes and push changes to AWS S3.

monitor.py will monitor the secrets specified in the CERT_PROXY_CERTIFICATES
environment variable.  When a secret is updated, the updated secret is pushed
to the specified AWS S3 bucket.
"""

import base64
import os
from pathlib import Path
import tempfile
import time
from typing import Dict

from aws_backup import AwsBackup
from kubernetes import client, config, watch


class TlsSecret:
    def __init__(self, cert_spec: str) -> None:
        self.hostname, aws_bucket = cert_spec.split("@")
        self.aws = AwsBackup(bucket=aws_bucket)
        self.name = f"{self.hostname.replace('.', '-')}-tls"

    def push(self, data: bytes, filename: str) -> None:
        """
        Push single file associated with the TLS secret to AWS S3 storage.

        Args:
            data: contents of the file to be pushed.
            filename: name of the file, e.g. cert.pem, key.pem.

        Example:
            a_secret.push(data=b'<my cert data>', filename="cert.pem")
            will create a file that contains the data received in the AWS
            S3 bucket under my-cert-tls/cert.pem.
        """
        secret_dest = f"{self.name}/{filename}"
        print(f"Push {secret_dest} to AWS {self.aws.bucket}", flush=True)
        with tempfile.TemporaryDirectory() as temp_dir:
            secret_dir = Path(temp_dir) / self.name
            secret_dir.mkdir(parents=True, exist_ok=True)
            secret_filename = secret_dir / filename
            secret_filename.write_bytes(data)
            self.aws.push(secret_filename, secret_dest)


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
    # The API server ends each watch after this many seconds, so that a new
    # watch is started, which re-pushes all the secrets.
    watch_timeout = 1800
    # If no data arrives for this long, the connection is assumed dead.
    read_timeout = watch_timeout + 60
    retry_delay = 30

    def __init__(self) -> None:
        self.secrets_dict = CertMonitor.get_secrets_dict()
        self.k8s_namespace = os.environ["CERT_PROXY_NAMESPACE"]

    @staticmethod
    def get_secrets_dict() -> Dict[str, TlsSecret]:
        """
        Create the list of secrets to monitor.

        Create the list of secrets to monitor from the CERT_PROXY_CERTIFICATES
        environment variable.  This function assumes that the secret name is '-tls'
        appended to the dns name of the server (with '.' converted to '-').
        """
        secret_dict: Dict[str, TlsSecret] = {}
        if "CERT_PROXY_CERTIFICATES" in os.environ:
            for item in os.environ["CERT_PROXY_CERTIFICATES"].split():
                secret = TlsSecret(item)
                secret_dict[secret.name] = secret
        return secret_dict

    def monitor(self) -> None:
        """Monitor for updates to the secrets, restarting the watch as needed."""
        config.load_incluster_config()
        core_api = client.CoreV1Api()
        while True:
            try:
                self.watch_secrets(core_api)
            except Exception as err:
                print(f"Watch failed ({err!r}); restarting in {self.retry_delay}s.", flush=True)
                time.sleep(self.retry_delay)

    def watch_secrets(self, core_api: client.CoreV1Api) -> None:
        """Push the secrets on each event until the watch times out."""
        watch_obj = watch.Watch()
        for event in watch_obj.stream(
            core_api.list_namespaced_secret,
            namespace=self.k8s_namespace,
            timeout_seconds=self.watch_timeout,
            _request_timeout=self.read_timeout,
        ):
            secret_name = event["object"].metadata.name
            event_type = event["type"]
            print(f"Event: {event_type} {secret_name}", flush=True)
            if (event_type in CertMonitor.trigger_events) and (secret_name in self.secrets_dict):
                self.secrets_dict[secret_name].push(
                    data=base64.b64decode(event["object"].data["tls.key"]),
                    filename="key.pem",
                )
                self.secrets_dict[secret_name].push(
                    data=base64.b64decode(event["object"].data["tls.crt"]),
                    filename="cert.pem",
                )


def main() -> None:
    cert_monitor = CertMonitor()
    cert_monitor.monitor()


if __name__ == "__main__":
    main()
