"""
Create a common definition of project configuration items.

Define the configuration items for the Docker Compose and Kubernetes set
scripts in a common location.
"""

import json
import os
from pathlib import Path
import re
from typing import Dict, List, Optional, Union


def get_image_name(repo: Optional[str], component: str, tag: Optional[str]) -> str:
    """Build the image name from the repo, the component, and the image tag."""
    tag_str = ""
    if tag is not None and len(tag):
        tag_str = f":{tag}"
    if repo is not None and len(repo):
        return f"{repo}/combine_{component}{tag_str}"
    return f"combine_{component}{tag_str}"


def get_proj_config(
    project_dir: Path,
    *,
    repo: Optional[str] = None,
    release: str = "latest",
    no_email: bool = False,
    no_captcha: bool = False,
    no_expire: bool = False,
) -> Dict[str, Union[List[str], str, int, bool]]:
    """Build dictionary of project configuration for development use."""
    return {
        "app_namespace": "thecombine",
        "backend_data_size": "4Gi",
        "database_data_size": "2Gi",
        "combine_image_frontend": get_image_name(repo, "frontend", release),
        "combine_image_backend": get_image_name(repo, "backend", release),
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
        "config_captcha_required": json.dumps(not no_captcha),
        "config_captcha_sitekey": "6Le6BL0UAAAAAMjSs1nINeB5hqDZ4m3mMg3k67x3",
        "config_email_enabled": json.dumps(not no_email),
        "config_show_cert_expiration": json.dumps(not no_expire),
        "server_name": "localhost",
        "mongodb_version": "4.4",
        #
        # The following configuration items are only needed for Docker Compose:
        #
        "combine_use_syslog": False,
        "combine_image_certmgr": get_image_name(repo, "certmgr", release),  # Docker Compose
        "ssl_certificate": "/etc/cert_store/nginx/localhost/fullchain.pem",
        "ssl_private_key": "/etc/cert_store/nginx/localhost/privkey.pem",
        "cert_max_connect_tries": "10",  # Docker Compose
        "combine_app_dir": re.sub(r"\\", r"\\\\", str(project_dir)),
        "backend_files_subdir": ".CombineFiles",
        "mongo_files_subdir": "dump",
        "aws_s3_backup_loc": "thecombine.app/backups",
        "aws_s3_profile": "default",
        "combine_host": "{{ combine_server_name | replace('.', '-') }}",
    }
