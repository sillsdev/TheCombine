#! /usr/bin/env python3

import os
import sys
import time
from typing import Callable, Tuple

from basecert import BaseCert
from func import *
from letsencryptcert import LetsEncryptCert
from selfsignedcert import SelfSignedCert

if __name__ == "__main__":

    mode_choices: Tuple[str, BaseCert] = {
        "self-signed": SelfSignedCert(),
        "letsencrypt": LetsEncryptCert(),
        "cert_server": BaseCert(),
        "cert_client": BaseCert(),
    }

    init_cert_store(lookup_env("CERT_STORE"))
    cert_mode: str = lookup_env("CERT_MODE")
    print(f"Running in {cert_mode} mode")
    cert_obj = mode_choices.get(cert_mode, BaseCert())

    cert_obj.create()
    while True:
        # sleep for 12 hours before checking for renewal
        time.sleep(12 * 3600)
        cert_obj.renew()

    # Should never get here but if we do, return a big return code
    sys.exit(99)
