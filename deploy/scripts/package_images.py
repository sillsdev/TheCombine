#!/usr/bin/env python

"""
Package the container images used for The Combine to support air-gapped installation.

The package_images.py script uses the `helm template` command to print the rendered
helm templates for the middleware used by The Combine and for The Combine itself.  The
image names are extracted from the templates and then pulled from the repo and stored
in ../images as compressed tarballs; zstd compression is used.
"""

import argparse
import logging
import os
from pathlib import Path
import re
from typing import Any, Dict, List

import combine_charts
from utils import init_logging, run_cmd
import yaml

# Define configuration and output directories
scripts_dir = Path(__file__).resolve().parent
ansible_dir = scripts_dir.parent / "ansible"
helm_dir = scripts_dir.parent / "helm"


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Package container images for The Combine.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    # Add Required arguments
    parser.add_argument(
        "tag",
        help="Tag for the container images to be installed for The Combine.",
    )
    parser.add_argument("output_dir", help="Directory for the collected image files.")
    # Add Optional arguments
    parser.add_argument(
        "--config",
        "-c",
        help="Configuration file for the cluster type(s).",
        default=str(scripts_dir / "setup_files" / "cluster_config.yaml"),
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debugging output.",
    )
    parser.add_argument(
        "--quiet",
        "-q",
        action="store_true",
        help="Print less output information.",
    )
    return parser.parse_args()


def package_k3s(dest_dir: Path, *, debug: bool = False) -> None:
    logging.info("Packaging k3s images.")
    ansible_cmd = [
        "ansible-playbook",
        "playbook_k3s_airgapped_files.yml",
        "--extra-vars",
        f"package_dir={dest_dir}",
    ]
    if debug:
        ansible_cmd.append("-vv")
    run_cmd(ansible_cmd, cwd=str(ansible_dir), print_cmd=debug, print_output=debug)


def package_images(image_list: List[str], tar_file: Path, *, debug: bool = False) -> None:
    container_cli_cmd = [os.getenv("CONTAINER_CLI", "docker")]
    if container_cli_cmd[0] == "nerdctl":
        container_cli_cmd.extend(["--namespace", "k8s.io"])

    # Pull each image
    for image in image_list:
        pull_cmd = container_cli_cmd + ["pull", image]
        run_cmd(pull_cmd, print_cmd=debug, print_output=debug)

    # Save pulled images into a .tar archive
    save_cmd = container_cli_cmd + ["save"] + image_list + ["-o", str(tar_file)]
    run_cmd(save_cmd, print_cmd=debug, print_output=debug)

    # Compress the tarball
    tar_cmd = ["zstd", "--rm", "--force", str(tar_file)]
    if not debug:
        tar_cmd.append("--quiet")
    run_cmd(tar_cmd, print_cmd=debug, print_output=debug)


def package_middleware(
    config_file: str, *, cluster_type: str, image_dir: Path, chart_dir: Path, debug: bool = False
) -> None:
    logging.info("Packaging middleware images.")

    # Read in cluster configuration
    with open(config_file) as file:
        config: Dict[str, Any] = yaml.safe_load(file)

    # Get current repos
    curr_repo_list: List[str] = []
    middleware_images: List[str] = []
    helm_list_cmd = ["helm", "repo", "list", "-o", "yaml"]
    if debug:
        helm_list_cmd.append("--debug")
    helm_cmd_results = run_cmd(
        helm_list_cmd, check_results=False, print_cmd=debug, print_output=debug
    )
    if helm_cmd_results.returncode == 0:
        curr_helm_repos = yaml.safe_load(helm_cmd_results.stdout)
        for repo in curr_helm_repos:
            curr_repo_list.append(repo["name"])

    for chart_descr in config["clusters"][cluster_type]:
        logging.debug(f"Chart: ${chart_descr}")

        # Add the chart's repo if we don't already have it
        repo = config[chart_descr]["repo"]
        if repo["name"] not in curr_helm_repos:
            helm_add_cmd = ["helm", "repo", "add", repo["name"], repo["url"]]
            if debug:
                helm_add_cmd.append("--debug")
            run_cmd(helm_add_cmd, print_cmd=debug, print_output=debug)
            curr_repo_list.append(repo["name"])

        # Pull the middleware chart
        chart = config[chart_descr]["chart"]
        dest_dir = chart_dir / chart["name"]
        dest_dir.mkdir(mode=0o755, parents=True, exist_ok=True)
        helm_pull_cmd = ["helm", "pull", chart["reference"], "--destination", str(dest_dir)]
        if debug:
            helm_pull_cmd.append("--debug")
        if "version" in chart:
            helm_pull_cmd.extend(["--version", chart["version"]])
        run_cmd(helm_pull_cmd, print_cmd=debug, print_output=debug)

        # Render chart templates and extract images
        for chart_file in dest_dir.glob("*.tgz"):
            results = run_cmd(["helm", "template", chart_file], print_cmd=debug)
            for line in results.stdout.splitlines():
                match = re.match(r'[-\s]+image:\s+"*([^"\n]*)"*', line)
                if match and not match.group(1) in middleware_images:
                    logging.debug(f"    - Found image {match.group(1)}")
                    middleware_images.append(match.group(1))

    logging.debug(f"Middleware images: {middleware_images}")
    package_images(
        middleware_images, image_dir / "middleware-airgap-images-amd64.tar", debug=debug
    )


def package_thecombine(tag: str, image_dir: Path, *, debug: bool = False) -> None:
    logging.info(f"Packaging The Combine version {tag}.")
    logging.debug("Create helm charts from templates")
    combine_charts.generate(tag)

    logging.debug(" - Get template for The Combine.")
    helm_template_cmd = [
        "helm",
        "template",
        "thecombine",
        str(helm_dir / "thecombine"),
        "--dependency-update",
        "--set",
        "global.imageRegistry=public.ecr.aws/thecombine",
        "--set",
        f"global.imageTag={tag}",
    ]
    if debug:
        helm_template_cmd.append("--debug")
    results = run_cmd(helm_template_cmd, print_cmd=debug)

    combine_images: List[str] = []
    for line in results.stdout.splitlines():
        match = re.match(r'^[-\s]+image:\s+"*([^"\n]*)"*', line)
        if match:
            image = match.group(1)
            if image not in combine_images:
                logging.debug(f"    - Found image {image}")
                combine_images.append(image)
    logging.debug(f"Combine images: {combine_images}")

    # Logout of AWS to allow pulling the images
    package_images(combine_images, image_dir / "combine-airgap-images-amd64.tar", debug=debug)


def main() -> None:
    args = parse_args()

    init_logging(args)

    output_dir = Path(args.output_dir).resolve()
    image_dir = output_dir / "airgap-images"
    image_dir.mkdir(mode=0o755, parents=True, exist_ok=True)
    chart_dir = output_dir / "airgap-charts"
    chart_dir.mkdir(mode=0o755, parents=True, exist_ok=True)

    # Clear the AWS variables so that they don't end up in the installer
    os.environ["AWS_ACCESS_KEY_ID"] = ""
    os.environ["AWS_SECRET_ACCESS_KEY"] = ""
    os.environ["AWS_ACCOUNT"] = ""
    os.environ["AWS_DEFAULT_REGION"] = ""

    # Update helm repos
    package_k3s(image_dir, debug=args.debug)
    package_middleware(
        args.config,
        cluster_type="standard",
        image_dir=image_dir,
        chart_dir=chart_dir,
        debug=args.debug,
    )
    package_thecombine(args.tag, image_dir, debug=args.debug)


if __name__ == "__main__":
    main()
