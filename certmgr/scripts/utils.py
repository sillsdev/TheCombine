"""Collection of utility functions for managing certificates."""


import os
from pathlib import Path
from sys import stderr
from typing import Dict

import requests

env_defaults: Dict[str, str] = {
    "CERT_MODE": "self-signed",
    "CERT_STORE": "/etc/cert_store",
    "CERT_EMAIL": "",
    "CERT_STAGING": "0",
    "MAX_CONNECT_TRIES": "15",
    "CERT_ADDL_DOMAINS": "",
    "SERVER_NAME": "",
    "CERT_SELF_RENEWAL": "30",  # days before expiry
    "CERT_PROXY_RENEWAL": "60",  # days before expiry
    "CERT_PROXY_DOMAINS": "",
    "AWS_S3_CERT_LOC": "thecombine.app/certs",
}


class MissingEnvironmentVariableError(Exception):
    """Exception to raise when an environment variable's value cannot be found."""


def get_setting(env_var: str) -> str:
    """
    Look up environment variable.

    get_setting returns the value of the specified environment variable.
    If the environment variable is not set, get_setting returns a default value
    that is defined in env_defaults.  If the variable is not set and is not listed
    in env_defaults, then get_setting returns None.

    Args:
        env_var: Environment variable to be looked up.

    """
    if env_var in os.environ:
        return os.environ[env_var]
    if env_var in env_defaults:
        return env_defaults[env_var]
    raise MissingEnvironmentVariableError(
        f"{env_var} is not defined and does not have a default value"
    )


def update_link(src: Path, dest: Path) -> None:
    """
    Create/move a symbolic link at 'dest' to point to 'src'.

    If dest is a symbolic link and it points to a different target file, than
    src, it changes the link to point to src.
    If dest does not exist the link is created.
    If dest exists but is not a symbolic link, update_link prints a warning on
    STDERR; no changes are made to dest.

    Args:
        src: link target file
        dest: link location

    """
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


def is_reachable(url: str, redirects: bool) -> bool:
    """
    Test if a web site is reachable.

    This test has two different uses in the certmgr container:
      1. Test if the NGINX server is up; and
      2. Test if the device, e.g. the NUC, is connected to the internet.

    Args:
        url: the URL to be tested
        redirects: a boolean value that specifies if redirects are allowed.

    """
    try:
        resp: requests.Response = requests.get(url, allow_redirects=redirects)
    except requests.ConnectionError:
        return False
    else:
        if resp.status_code in (200, 301):
            return True
        return False
