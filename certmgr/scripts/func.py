#!/usr/bin/env python3

import os
import sys
from typing import Tuple, Union

env_defaults: Tuple[str, Union[str, int]] = {
    "CERT_MODE": "self-signed",
    "CERT_STORE": "/etc/cert_store",
    "CERT_EMAIL": "",
    "CERT_STAGING": 0,
    "MAX_CONNECT_TRIES": 15,
    "CERT_DOMAINS": "",
    "SERVER_NAME": "",
}


def lookup_env(env_var: str) -> Union[str, int]:
    if env_var in os.environ:
        return os.environ[env_var]
    elif env_var in env_defaults:
        return env_defaults[env_var]
    else:
        print(f"Required environment variable, {env_var} is missing.")
        sys.exit(3)


def update_link(src: str, target: str) -> None:

    print(f"linking {src} to {target}")
    if os.path.exists(target):
        assert os.path.islink(target)
        link_target: str = os.readlink(target)
        if link_target != src:
            os.unlink(target)
        else:
            # src already point to the target
            return
    os.symlink(src, target)
