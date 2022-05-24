#! /usr/bin/env python3
"""
Update the Helm chart version with the specified version.
"""

import argparse
from pathlib import Path

from jinja2 import Environment, PackageLoader, select_autoescape

helm_dir = Path(__file__).resolve().parent.parent / "helm"

# Map the chart names to their location.  This is useful for updating
# dependencies (in Chart.yaml) as well as the charts.
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


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    # Parse user command line arguments
    parser = argparse.ArgumentParser(
        description="Update the version and appVersions for the Helm charts.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "version",
        help="New version for the Helm charts.",
    )
    return parser.parse_args()


def generate(version: str) -> None:
    print("New version: {version}")
    version_config = {
        "version": {
            "aws_login": "v0.2.0",
            "thecombine": f"v{version}",
            "cert_proxy_client": f"v{version}",
            "cert_proxy_server": f"v{version}",
            "create_admin_user": f"v{version}",
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

        template = jinja_env.get_template("Chart.yaml.j2")
        final_chart = chart_dir / "Chart.yaml"
        print(f"Writing: {final_chart}")
        final_chart.write_text(template.render(version_config))


def main() -> None:
    args = parse_args()
    generate(args.version)


if __name__ == "__main__":
    main()
