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
import re

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
        "combine_use_syslog": False,
        "combine_image_frontend": f"combine/frontend:{image_tag}",
        "combine_image_backend": f"combine/backend:{image_tag}",
        "combine_image_certmgr": f"combine/certmgr:{image_tag}",
        "cert_email": "",
        "cert_mode": "self-signed",
        "cert_is_staging": 0,
        "cert_domains": ["localhost"],
        "cert_clean": 0,
        "combine_server_name": "localhost",
        "combine_jwt_secret_key": os.getenv(
            "COMBINE_JWT_SECRET_KEY", "JwtSecretKeyForDevelopmentUseOnly"
        ),
        "combine_smtp_server": os.getenv("COMBINE_SMTP_SERVER", ""),
        "combine_smtp_port": os.getenv("COMBINE_SMTP_PORT", "587"),
        "combine_smtp_address": os.getenv("COMBINE_SMTP_ADDRESS", ""),
        "combine_smtp_username": os.getenv("COMBINE_SMTP_USERNAME", ""),
        "combine_smtp_password": os.getenv("COMBINE_SMTP_PASSWORD", ""),
        "combine_smtp_from": os.getenv("COMBINE_SMTP_FROM", ""),
        "combine_password_reset_expire_time": os.getenv(
            "COMBINE_PASSWORD_RESET_EXPIRE_TIME", "15"
        ),
        "ssl_certificate": "/etc/cert_store/nginx/localhost/fullchain.pem",
        "ssl_private_key": "/etc/cert_store/nginx/localhost/privkey.pem",
        "config_captcha_required": json.dumps(not args.no_captcha),
        "config_captcha_sitekey": "6Le6BL0UAAAAAMjSs1nINeB5hqDZ4m3mMg3k67x3",
        "cert_max_connect_tries": "10",
        "server_name": "localhost",
        "mongodb_version": "4.4",
        "combine_app_dir": re.sub(r"\\", r"\\\\", str(project_dir)),
        "backend_files_subdir": ".CombineFiles",
        "mongo_files_subdir": "dump",
        "aws_s3_backup_loc": "thecombine.app/backups",
        "aws_s3_profile": "default",
        "combine_host": "{{ combine_server_name | replace('.', '-') }}",
    }

    # Templated file map
    template_map = {
        "docker-compose.yml.j2": project_dir / "docker-compose.yml",
        "env.frontend.j2": project_dir / ".env.frontend",
        "env.backend.j2": project_dir / ".env.backend",
        "env.certmgr.j2": project_dir / ".env.certmgr",
    }

    # Initialize the Jinja2 environment
    jinja_env = Environment(
        loader=PackageLoader(
            "docker_setup",
            str(Path("..") / "deploy" / "roles" / "combine_config" / "templates"),
        ),
        autoescape=select_autoescape(["html", "xml"]),
        trim_blocks=False,
        lstrip_blocks=True,
    )

    for templ_name, templ_path in template_map.items():
        template = jinja_env.get_template(templ_name)
        print(f"Writing: {templ_path}")
        templ_path.write_text(template.render(dev_config))

    # Restrict permissions for the environment files
    for env_file in [
        project_dir / ".env.backend",
        project_dir / ".env.frontend",
        project_dir / ".env.certmgr",
    ]:
        env_file.chmod(0o600)

    # setup maintenance configuration
    jinja_env = Environment(
        loader=PackageLoader(
            "docker_setup",
            str(Path("..") / "deploy" / "roles" / "combine_maintenance" / "templates"),
        ),
        autoescape=select_autoescape(["html", "xml"]),
        trim_blocks=True,
        lstrip_blocks=True,
    )
    templ_name = "script_conf.json.j2"
    templ_path = (
        project_dir / "deploy" / "roles" / "combine_maintenance" / "files" / "script_conf.json"
    )
    template = jinja_env.get_template(templ_name)
    print(f"Writing: {templ_path}")
    templ_path.write_text(template.render(dev_config))


if __name__ == "__main__":
    main()
