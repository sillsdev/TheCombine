"""Collection of utility functions for managing certificates."""


import os
from pathlib import Path
from typing import Dict, Optional, Union

env_defaults: Dict[str, Union[str, int, bool]] = {
    "CERT_MODE": "self-signed",
    "CERT_STORE": "/etc/cert_store",
    "CERT_EMAIL": "",
    "CERT_STAGING": 0,
    "MAX_CONNECT_TRIES": 15,
    "CERT_ADDL_DOMAINS": "",
    "SERVER_NAME": "",
    "SELF_CERT_RENEWAL": 30,  # days before expriy
    "PROXY_CERT_RENEWAL": 60,  # days before expiry
    "PROXY_CERT_DOMAINS": "",
    "AWS_S3_CERT_LOC": "thecombine.app/certs",
}


def get_setting(env_var: str) -> Optional[Union[str, int, bool]]:
    """
    Look up environment variable.

    Look up an environment variable and return its value or its
    default value.  It the variable is not set and is not listed
    in the defaults, then None is returned
    """
    if env_var in os.environ:
        return os.environ[env_var]
    if env_var in env_defaults:
        return env_defaults[env_var]
    return None


def update_link(src: Path, dest: Path) -> None:
    """
    Create/move a symbolic link at 'dest' to point to 'src'.

    If dest already exists and is not a link, it is deleted first.
    """
    print(f"linking {src} to {dest}")
    if dest.exists():
        if dest.is_symlink():
            link_target: str = os.readlink(dest)
            if link_target != src:
                dest.unlink()
            else:
                # src already points to the dest
                return
        else:
            print(f"{dest} exists and is not a link")
            dest.unlink()
    dest.symlink_to(src)


def update_renew_before_expiry(domain: str, renew_before_expiry_period: int) -> None:
    """Update the RENEW_BEFORE_EXPIRY configuration value for 'domain'."""
    renew_before_expiry = str(renew_before_expiry_period)
    print(f"Setting renew before expiry for {domain} " f"to {renew_before_expiry}")
    renew_config = f"/etc/letsencrypt/renewal/{domain}.conf"
    if os.path.exists(renew_config):
        os.system(
            "sed -i 's/#* *renew_before_expiry = [0-9][0-9]* days/"
            f"renew_before_expiry = {renew_before_expiry} days/' "
            f" {renew_config}"
        )
