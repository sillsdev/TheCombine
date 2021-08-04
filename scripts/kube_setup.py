#!/usr/bin/env python3

"""
Create YAML files needed to run TheCombine in Kubernetes environment in development.

This script sets up your development environment to be able to run
TheCombine as a Kubernetes cluster in an environment as similar to the
production environment as possible. The script shall be run from the
project's root directory.

Tasks:
    1. Create the following directory:
        ../nginx/scripts
    2. Build Kubernetes YAML files from
       roles/k8s_config/templates/*.yaml.j2
    3. Apply generated YAML files
"""

import argparse
import os
from pathlib import Path

from development_config import get_proj_config
from jinja2 import Environment, PackageLoader, select_autoescape

project_dir = Path(__file__).resolve().parent.parent
"""Absolute path to the checked out repository."""


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate and apply Kubernetes configuration for project.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--repo", help="Image repository to use instead of a local image")
    parser.add_argument(
        "--release",
        help="Pull image from image repo rather than use a local image.",
    )
    parser.add_argument(
        "--no-captcha",
        action="store_true",
        help="Disable the CAPTCHA from the frontend build.",
    )
    parser.add_argument(
        "--no-email",
        action="store_true",
        help="Simulate running with no e-mail services.",
    )
    parser.add_argument(
        "--no-expire",
        action="store_true",
        help="Do not show certificate expiration warning indicators.",
    )
    return parser.parse_args()


def main() -> None:
    """Create Kubernetes YAML files for development use."""
    args = parse_args()
    kube_files_templ = project_dir / "deploy" / "roles" / "k8s_config" / "templates"
    kube_files_dir = project_dir / "deploy" / "site_files" / "development"
    kube_files_dir.mkdir(0o755, parents=True, exist_ok=True)
    # Define the configuration for the development environment
    dev_config = get_proj_config(
        project_dir,
        repo=args.repo,
        release=args.release,
        no_email=args.no_email,
        no_captcha=args.no_captcha,
        no_expire=args.no_expire,
    )
    # Initialize the Jinja2 environment
    jinja_env = Environment(
        loader=PackageLoader(
            "kube_setup",
            str(Path("..") / "deploy" / "roles" / "k8s_config" / "templates"),
        ),
        autoescape=select_autoescape(["html", "xml"]),
        trim_blocks=False,
        lstrip_blocks=True,
        extensions=["jinja2_base64_filters.Base64Filters"],
    )

    for templ_path in kube_files_templ.glob("*.yaml.j2"):
        template = jinja_env.get_template(templ_path.name)
        output_file = kube_files_dir / templ_path.stem
        print(f"Writing: {output_file}")
        output_file.write_text(template.render(dev_config))

    # Restrict permissions for the environment files
    for secrets_file in kube_files_dir.glob("*secrets.yaml"):
        secrets_file.chmod(0o600)

    os.chdir(f"{kube_files_dir}")
    kubectl_config = kube_files_dir / "kubeconfig"
    if not kubectl_config.exists():
        os.system("microk8s config > kubeconfig")
    for k8s_cfg_file in sorted(kube_files_dir.glob("*.yaml")):
        print(f"Applying {k8s_cfg_file}")
        os.system(f"kubectl --kubeconfig={{ kubecfg }} apply -f {k8s_cfg_file}")


if __name__ == "__main__":
    main()
