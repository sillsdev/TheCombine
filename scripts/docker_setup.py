#!/usr/bin/env python3

"""
Create docker files needed to run TheCombine in containers in development.

This script sets up your development environment to be able to run
TheCombine in Docker containers in an environment as similar to the
production environment as possible. The script shall be run from the
project's root directory.

Tasks:
    1. Create the following directory:
        ../nginx/scripts
    2. Build docker-compose.yml from
       roles/combine_config/templates/docker-compose.yml.j2
    3. Create frontend environment file
    4. Create backend environment file (w/o SMTP specified)
    5. Create nginx configuration file
"""

import argparse
import json
import os
from pathlib import Path

from jinja2 import Environment, PackageLoader, select_autoescape

project_dir = Path(__file__).resolve().parent.parent
"""Absolute path to the checked out repository."""


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate Docker Compose configuration for project.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--pull-images",
        action="store_true",
        help="Pull pre-built Docker images from the Internet rather than rebuild them from the "
        "current local repository checkout.",
    )
    parser.add_argument(
        "--no-captcha",
        action="store_true",
        help="Disable the CAPTCHA from the frontend build.",
    )
    return parser.parse_args()


def get_image_tag() -> str:
    """
    Read the docker image tag.

    Read the docker image tag from the IMAGE_TAG environment variable and return
    its value.  If IMAGE_TAG is not defined, return "latest".
    """
    if "IMAGE_TAG" in os.environ:
        return os.environ["IMAGE_TAGE"]
    return "latest"


def main() -> None:
    """Create docker-compose.yml for development use."""
    args = parse_args()
    image_tag = get_image_tag()
    # Define the configuration for the development environment
    dev_config = {
        "combine_pull_images": args.pull_images,
        "combine_image_frontend": f"combine/frontend:{image_tag}",
        "combine_image_backend": f"combine/backend:{image_tag}",
        "combine_image_certmgr": f"combine/certmgr:{image_tag}",
        "cert_email": "",
        "cert_mode": "self-signed",
        "cert_is_staging": 0,
        "cert_domains": ["localhost"],
        "cert_clean": 0,
        "combine_server_name": "localhost",
        "ssl_certificate": "/etc/nginx/ssl/localhost/fullchain.pem",
        "ssl_private_key": "/etc/nginx/ssl/localhost/privkey.pem",
        "combine_backend_env_vars": "",
        "combine_private_env_vars": [
            {"key": "COMBINE_JWT_SECRET_KEY", "value": "JwtSecretKeyForDevelopmentUseOnly"},
            {"key": "COMBINE_SMTP_SERVER", "value": ""},
            {"key": "COMBINE_SMTP_PORT", "value": "587"},
            {"key": "COMBINE_SMTP_ADDRESS", "value": ""},
            {"key": "COMBINE_SMTP_USERNAME", "value": ""},
            {"key": "COMBINE_SMTP_PASSWORD", "value": ""},
            {"key": "COMBINE_SMTP_FROM", "value": ""},
            {"key": "COMBINE_PASSWORD_RESET_EXPIRE_TIME", "value": "15"},
        ],
        "combine_frontend_env_vars": [
            {"key": "SERVER_NAME", "value": "localhost"},
            {"key": "SSL_CERTIFICATE", "value": "/etc/cert_store/nginx/localhost/fullchain.pem"},
            {"key": "SSL_PRIVATE_KEY", "value": "/etc/cert_store/nginx/localhost/privkey.pem"},
        ],
        "combine_cert_env_vars": [
            {"key": "CERT_MODE", "value": "self-signed"},
            {"key": "CERT_EMAIL", "value": ""},
            {"key": "CERT_STAGING", "value": "0"},
            {"key": "MAX_CONNECT_TRIES", "value": "10"},
            {"key": "SERVER_NAME", "value": "localhost"},
        ],
        "config_captcha_required": json.dumps(not args.no_captcha),
        "config_captcha_sitekey": "6Le6BL0UAAAAAMjSs1nINeB5hqDZ4m3mMg3k67x3",
        "mongodb_version": "4.4",
    }

    # Templated file map
    template_map = {
        "docker-compose.yml.j2": project_dir / "docker-compose.yml",
        "env.frontend.j2": project_dir / ".env.frontend",
        "env.backend.j2": project_dir / ".env.backend",
        "env.certmgr.j2": project_dir / ".env.certmgr",
        "config.js.j2": project_dir / "nginx" / "scripts" / "config.js",
    }

    # Set backend private env_vars if they are defined for our process
    for env_var in dev_config["combine_private_env_vars"]:
        if env_var["key"] in os.environ:
            env_var["value"] = os.environ[env_var["key"]]

    # Set backend common env_vars if they are defined for our process
    for env_var in dev_config["combine_backend_env_vars"]:
        if env_var["key"] in os.environ:
            env_var["value"] = os.environ[env_var["key"]]

    # Initialize the Jinja2 environment
    jinja_env = Environment(
        loader=PackageLoader(
            "docker_setup",
            str(Path("..") / "deploy" / "roles" / "combine_config" / "templates"),
        ),
        autoescape=select_autoescape(["html", "xml"]),
        trim_blocks=True,
        lstrip_blocks=True,
    )
    (project_dir / "nginx" / "scripts").mkdir(exist_ok=True)

    for templ_name, templ_path in template_map.items():
        template = jinja_env.get_template(templ_name)
        print(f"Writing: {templ_path}")
        templ_path.write_text(template.render(dev_config))

    # Restrict permissions for the environment files
    for env_file in [project_dir / ".env.backend", project_dir / ".env.frontend"]:
        env_file.chmod(0o600)


if __name__ == "__main__":
    main()
