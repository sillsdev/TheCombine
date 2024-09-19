#!/usr/bin/env python3
"""Decode and print the contents of a Kubernetes secret."""
import argparse
import base64
import json
import subprocess
from typing import List, Dict

JsonSecret = Dict[str, str]

def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    parser = argparse.ArgumentParser(
        description="Decode and print the contents of a Kubernetes secret.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "secret", help="Kubernetes Secret to print"
    )
    parser.add_argument("--kubecfg", help="Kubernetes configuration file to use.")
    parser.add_argument("--namespace", help="Kubernetes namespace to use.")
    return parser.parse_args()


def main() -> None:
    """Print the contents of a Kubernetes secret in a human decipherable format."""
    args = parse_args()
    kubeopts: List[str] = []
    if args.kubecfg is not None and args.kubecfg:
        kubeopts += ["--kubeconfig", args.kubecfg]
    if args.namespace is not None and args.namespace:
        kubeopts += ["--namespace", args.namespace]
    try:
        results = subprocess.run(
            ["kubectl"] + kubeopts + ["get", "secret", args.secret, "-o", "jsonpath={.data}"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            check=True,
        )
    except subprocess.CalledProcessError as err:
        print(f"CalledProcessError returned {err.returncode}")
        print(f"cmd: {err.cmd}")
        print(f"stdout: {err.stdout}")
        print(f"stderr: {err.stderr}")
        sys.exit(err.returncode)
    secrets: JsonSecret = json.loads(results.stdout)
    for key in sorted(secrets):
        decodedBytes = base64.b64decode(secrets[key])
        print(f"{key}: {str(decodedBytes, 'utf-8')}")

if __name__ == "__main__":
    main()
