#!/usr/bin/env python3

"""
This script sets up your development environment to be able to run
TheCombine in docker containers in an environment as similar to the
production environment as possible.  The script shall be run from the
project's root directory.
"""

import os
import shutil

from jinja2 import Environment, PackageLoader, select_autoescape

"""
Tasks:
 1. create the following directories:
    ./nginx/scripts
    ./nginx/conf.d
 2. build docker-compose.yml from
    roles/combine_config/templates/docker-compose.yml.j2
 3. create frontend environment file
 4. create backend environment file (w/o SMTP specified)
 5. create nginx configuration file
 """


def config_nginx() -> None:
    nginx_dir_list = ["./nginx/scripts", "./nginx/conf.d"]

    for nginx in nginx_dir_list:
        if not os.path.isdir(nginx):
            os.mkdir(nginx)

    # copy the nginx config file over
    shutil.copy2(
        "./docker_deploy/roles/combine_config/files/thecombine.conf",
        "./nginx/conf.d/thecombine.conf",
    )


# def build_docker_compose(jinja_env, config):
#     template = jinja_env.get_template('docker-compose.yml.j2')
#     with open('docker-compose.yml', 'w') as compose_file:
#         compose_file.write(template.render(config))

def main() -> None:
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
            {"key": "COMBINE_SMTP_PORT", "value": ""},
            {"key": "COMBINE_SMTP_ADDRESS", "value": ""},
            {"key": "COMBINE_SMTP_USERNAME", "value": ""},
            {"key": "COMBINE_SMTP_PASSWORD", "value": ""},
            {"key": "COMBINE_SMTP_FROM", "value": ""},
            {"key": "COMBINE_PASSWORD_RESET_EXPIRE_TIME", "value": ""},
        ],
        "config_captcha_required": "true",
        "config_captcha_sitekey": "6Le6BL0UAAAAAMjSs1nINeB5hqDZ4m3mMg3k67x3",
    }
    # Templated file map
    template_map = {
        "docker-compose.yml.j2": "./docker-compose.yml",
        "env.frontend.j2": "./.env.frontend",
        "env.backend.j2": "./.env.backend",
        "config.js.j2": "./nginx/scripts/config.js",
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
        loader=PackageLoader('docker_setup', "./docker_deploy/roles/combine_config/templates"),
        autoescape=select_autoescape(['html', 'xml']),
    )
    config_nginx()

    for templ_name in template_map:
        template = jinja_env.get_template(templ_name)
        with open(template_map[templ_name], 'w') as target_file:
            target_file.write(template.render(dev_config))

    # restrict permissions for the environment files
    for env_file in [".env.backend", ".env.frontend"]:
        os.chmod(env_file, 0o600)


# Standard boilerplate to call main().
if __name__ == '__main__':
    main()
