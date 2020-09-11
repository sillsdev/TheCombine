#!/usr/bin/env python3

"""
This script sets up your development environment to be able to run
TheCombine in docker containers in an environment as similar to the
production environment as possible.  The script shall be run from the
project's root directory.
"""

import argparse
import os
from pathlib import Path
import shutil

from jinja2 import Environment, PackageLoader, select_autoescape

"""
Tasks:
 1. Create the following directories:
        ./nginx/scripts
        ./nginx/conf.d
 2. Build docker-compose.yml from
    roles/combine_config/templates/docker-compose.yml.j2
 3. Create frontend environment file
 4. Create backend environment file (w/o SMTP specified)
 5. Create nginx configuration file
"""

project_dir = Path(__file__).resolve().parent
"""Absolute path to the checked out repository."""


def config_nginx() -> None:
    nginx_config_dir = project_dir / "nginx"
    nginx_dirs = [
        nginx_config_dir / "scripts",
        nginx_config_dir / "conf.d",
    ]

    for nginx_dir in nginx_dirs:
        nginx_dir.mkdir(exist_ok=True)


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate Docker Compose configuration for project.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--no-captcha",
        action="store_true",
        help="Whether to disable the CAPTCHA from the frontend build.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    # Define the configuration for the development environment
    dev_config = {
        "combine_image_frontend": "combine/frontend:latest",
        "combine_image_backend": "combine/backend:latest",
        "certbot_email": "",
        "certbot_is_staging": 0,
        "combine_server_name": "localhost",
        "ssl_certificate": "/ssl/cert.pem",
        "ssl_private_key": "/ssl/key.pem",
        "combine_env_vars": "",
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
        "config_captcha_required": str(not args.no_captcha).lower(),
        "config_captcha_sitekey": "6Le6BL0UAAAAAMjSs1nINeB5hqDZ4m3mMg3k67x3",
    }
    # Templated file map
    template_map = {
        "docker-compose.yml.j2": project_dir / "docker-compose.yml",
        "env.frontend.j2": project_dir / ".env.frontend",
        "env.backend.j2": project_dir / ".env.backend",
        "config.js.j2": project_dir / "nginx" / "scripts" / "config.js",
    }

    # Set backend private env_vars if they are defined for our process
    for env_var in dev_config["combine_private_env_vars"]:
        if env_var["key"] in os.environ:
            env_var["value"] = os.environ[env_var["key"]]

    # Set backend common env_vars if they are defined for our process
    for env_var in dev_config["combine_env_vars"]:
        if env_var["key"] in os.environ:
            env_var["value"] = os.environ[env_var["key"]]

    # Initialize the Jinja2 environment
    jinja_env = Environment(
        loader=PackageLoader(
            'docker_setup',
            str(Path(".") / "docker_deploy" / "roles" / "combine_config" / "templates")
        ),
        autoescape=select_autoescape(['html', 'xml']),
        trim_blocks=True,
    )
    config_nginx()

    for templ_name, templ_path in template_map.items():
        template = jinja_env.get_template(templ_name)
        print(f'Writing: {templ_path}')
        templ_path.write_text(template.render(dev_config))

    # Restrict permissions for the environment files
    for env_file in [project_dir / ".env.backend", project_dir / ".env.frontend"]:
        os.chmod(env_file, 0o600)


# Standard boilerplate to call main().
if __name__ == '__main__':
    main()
