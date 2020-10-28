import os
from pathlib import Path
from typing import Dict, Optional, Union

env_defaults: Dict[str, Union[str, int]] = {
    "CERT_MODE": "self-signed",
    "CERT_STORE": "/etc/cert_store",
    "CERT_EMAIL": "",
    "CERT_STAGING": 0,
    "MAX_CONNECT_TRIES": 15,
    "CERT_ADDL_DOMAINS": "",
    "SERVER_NAME": "",
    "CERT_PROXY_RENEWAL": 30,
    "CERT_PROXY_DOMAINS": "",
}


def lookup_env(env_var: str) -> Optional[Union[str, int]]:
    """
    Look up environment variable

    Look up an environment variable and return its value or its
    default value.  It the variable is not set and is not listed
    in the defaults, then None is returned
    """
    if env_var in os.environ:
        return os.environ[env_var]
    elif env_var in env_defaults:
        return env_defaults[env_var]
    else:
        return None

def lookup_default(env_var: str) -> Optional[Union[str, int]]:
    """
    Look up our default value for an environment variable
    """
    if env_var in env_defaults:
        return env_defaults[env_var]
    else:
        return None
        
def update_link(src: Path, dest: Path) -> None:
    """
    Create/move a symbolic link at 'dest' to point to 'src'

    If dest already exists and is not a link, it is deleted
    first.
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
