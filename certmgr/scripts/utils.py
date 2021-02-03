"""Collection of utility functions for managing certificates."""


import os
from pathlib import Path
from sys import stderr
from typing import Dict, Union

env_defaults: Dict[str, Union[str, int]] = {
    "CERT_MODE": "self-signed",
    "CERT_STORE": "/etc/cert_store",
    "CERT_EMAIL": "",
    "CERT_STAGING": 0,
    "MAX_CONNECT_TRIES": 15,
    "CERT_ADDL_DOMAINS": "",
    "SERVER_NAME": "",
    "CERT_SELF_RENEWAL": 30,  # days before expiry
    "CERT_PROXY_RENEWAL": 60,  # days before expiry
    "CERT_PROXY_DOMAINS": "",
    "AWS_S3_CERT_LOC": "thecombine.app/certs",
}


class MissingEnvironmentVariableError(Exception):
    """Exception to raise when an environment variable's value cannot be found."""


def get_setting(env_var: str) -> Union[str, int, bool]:
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
    raise MissingEnvironmentVariableError(
        f"{env_var} is not defined and does not have a default value"
    )


def update_link(src: Path, dest: Path) -> None:
    """Create/move a symbolic link at 'dest' to point to 'src'."""
    if dest.is_symlink():
        link_target = os.readlink(dest)
        if link_target != src:
            dest.unlink()
            dest.symlink_to(src)
    elif not dest.exists():
        dest.symlink_to(src)
    else:
        print(
            "WARNING: Cannot create sym_link: " f"{src} -> {dest}",
            file=stderr,
        )
