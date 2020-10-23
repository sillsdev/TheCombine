#!/usr/bin/env python3

import os
from pathlib import Path
import sys
from typing import Dict, Union

env_defaults: Dict[str, Union[str, int]] = {
    "CERT_MODE": "self-signed",
    "CERT_STORE": "/etc/cert_store",
    "CERT_EMAIL": "",
    "CERT_STAGING": 0,
    "MAX_CONNECT_TRIES": 15,
    "CERT_ADDL_DOMAINS": "",
    "SERVER_NAME": "",
    "CERT_PROXY_RENEWAL": 30,
    "CERT_PROXY_DOMAINS": ""
}


def lookup_env(env_var: str) -> Union[str, int]:
    if env_var in os.environ:
        return os.environ[env_var]
    elif env_var in env_defaults:
        return env_defaults[env_var]
    else:
        print(f"Required environment variable, {env_var} is missing.")
        sys.exit(3)


def update_link(src: Path, dest: Path) -> None:

    print(f"linking {src} to {dest}")
    if dest.exists():
        if dest.is_symlink():
            link_target: str = dest.readlink()
            if link_target != src:
                dest.unlink()
            else:
                # src already point to the dest
                return
        else:
            print(f"{dest} exists and is not a link")
            dest.unlink()
    dest.symlink_to(src)
