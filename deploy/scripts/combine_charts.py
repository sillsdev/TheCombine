#! /usr/bin/env python3
"""
Update the Helm chart version with the specified version.
"""

import argparse
from pathlib import Path

from jinja2 import Environment, PackageLoader, select_autoescape

helm_dir = Path(__file__).resolve().parent.parent / "helm"

# List of the Helm Charts to be updated
helm_charts = [
    helm_dir / "aws-login",
    helm_dir / "thecombine",
    helm_dir / "thecombine" / "charts" / "backend",
    helm_dir / "thecombine" / "charts" / "database",
    helm_dir / "thecombine" / "charts" / "frontend",
    helm_dir / "thecombine" / "charts" / "maintenance",
    helm_dir / "cert-proxy-client",
    helm_dir / "cert-proxy-server",
    helm_dir / "create-admin-user",
]

default_aws_login_version = "0.2.0"


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    # Parse user command line arguments
    parser = argparse.ArgumentParser(
        description="Update version and appVersion occurrences for the Helm charts.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "version",
        help="New version for the Helm charts.",
    )
    parser.add_argument(
        "--aws", default=default_aws_login_version, help="Version for the aws-login functionality."
    )
    return parser.parse_args()


def generate(version: str, aws_login_version: str = default_aws_login_version) -> None:
    """Generate the Helm Charts for The Combine using the specified version numbers."""
    version_config = {
        "version": {
            "aws_login": aws_login_version,
            "thecombine": version,
            "cert_proxy_client": version,
            "cert_proxy_server": version,
            "create_admin_user": version,
        }
    }

    for chart_dir in helm_charts:
        # Initialize the Jinja2 environment
        jinja_env = Environment(
            loader=PackageLoader("combine_charts", str(chart_dir)),
            autoescape=select_autoescape(["html", "xml"]),
            trim_blocks=False,
            lstrip_blocks=True,
        )
        # Generate the Chart.yaml file from the Chart.yaml.j2 template
        template = jinja_env.get_template("Chart.yaml.j2")
        final_chart = chart_dir / "Chart.yaml"
        final_chart.write_text(template.render(version_config))


if __name__ == "__main__":
    """Allow calling from the command line for testing, etc."""
    args = parse_args()
    generate(args.version, args.aws)
