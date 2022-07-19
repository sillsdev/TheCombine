#! /usr/bin/env python3

import argparse
import subprocess
from typing import List, Optional

from utils import run_cmd


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    parser = argparse.ArgumentParser(
        description="Print the expiration date for each certificate installed on the target.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--namespace", "-n", help="Namespace to check for TLS secrets.")
    return parser.parse_args()


def get_expiration(secret: str, kubectl_opts: List[str]) -> Optional[str]:
    if not secret:
        return None
    get_secret = subprocess.Popen(
        ["kubectl"]
        + kubectl_opts
        + [
            "get",
            secret,
            "-o",
            r"jsonpath={.data['tls\.crt']}",
        ],
        stdout=subprocess.PIPE,
        text=True,
    )
    decode = subprocess.Popen(
        ["base64", "-d"],
        stdin=get_secret.stdout,
        stdout=subprocess.PIPE,
        text=True,
    )
    if get_secret.stdout is not None:
        get_secret.stdout.close()
    enddate = subprocess.Popen(
        [
            "openssl",
            "x509",
            "-enddate",
            "-noout",
        ],
        stdin=decode.stdout,
        stdout=subprocess.PIPE,
        text=True,
    )
    if decode.stdout is not None:
        decode.stdout.close()
    expiration = enddate.communicate()[0]
    expiration = expiration.replace("notAfter=", "").strip()
    return expiration


def main() -> None:
    """Setup access to the the target specified on the command line."""
    args = parse_args()

    if args.namespace is not None:
        kubectl_opts = ["-n", args.namespace]
    else:
        kubectl_opts = []

    secrets_list = run_cmd(
        ["kubectl"]
        + kubectl_opts
        + ["get", "secrets", "--field-selector", "type=kubernetes.io/tls", "-o", "name"]
    )

    for secret in secrets_list.stdout.split("\n"):
        if secret:
            print(f"{secret} expires on {get_expiration(secret, kubectl_opts)}")


if __name__ == "__main__":
    main()
