#! /usr/bin/env python3

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
    "CERT_VERBOSE": 0,
}


def lookup_env(env_var: str) -> Union[str, int]:
    if env_var in os.environ:
        return os.environ[env_var]
    elif env_var in env_defaults:
        return env_defaults[env_var]
    else:
        print(f"Required environment variable, {env_var} is missing.")
        sys.exit(3)


# Define a variable 'verbose' so that we only need to look up the
# environment variable once
verbose: bool = False if lookup_env("CERT_VERBOSE") == "0" else True


def debug_log(message: str) -> None:
    if lookup_env("CERT_VERBOSE") != "0":
        print(message)


def update_link(src: str, target: str) -> None:

    debug_log(f"linking {src} to {target}")
    if os.path.exists(target):
        assert os.path.islink(target)
        link_target: str = os.readlink(target)
        if link_target != src:
            os.unlink(target)
            debug_log("   Old link removed")
        else:
            debug_log(f"   {target} already points to {src}")
    os.symlink(src, target)
    if verbose:
        os.system(f"ls -ld {target}")
