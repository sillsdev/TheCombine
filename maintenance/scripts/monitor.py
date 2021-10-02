#!/usr/bin/env python3
"""
Monitor TLS secrets for changes and push changes to AWS S3.

monitor.py will monitor the secrets specified in the NUC_CERTIFICATES
environment variable.  When a secret is updated, the updated secret is pushed
to the AWS_S3_BUCKET.
"""

from kubernetes import client, config, watch


def main() -> None:
    config.load_incluster_config()

    v1 = client.CoreV1Api()
    print("Listing all configmaps in the default namespace:")
    w = watch.Watch()
    for event in w.stream(v1.list_namespaced_secret, namespace="default"):
        print("Event: %s %s" % (event["type"], event["object"].metadata.name))
    print("Ended.")


if __name__ == "__main__":
    main()
