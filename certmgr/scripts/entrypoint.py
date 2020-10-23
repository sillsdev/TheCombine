#!/usr/bin/env python3

import os
import sys
import time
from typing import Dict, Optional

from basecert import BaseCert
from func import lookup_env
from letsencryptcert import LetsEncryptCert
from selfsignedcert import SelfSignedCert

if __name__ == "__main__":

    mode_choices: Dict[str, Optional[BaseCert]] = {
        "self-signed": SelfSignedCert(),
        "letsencrypt": LetsEncryptCert(),
    }

    cert_store = lookup_env("CERT_STORE")
    for subdir in ("nginx", "selfsigned"):
        os.makedirs(f"{cert_store}/{subdir}", 0o755, True)

    cert_mode = lookup_env("CERT_MODE")
    print(f"Running in {cert_mode} mode")
    cert_obj = mode_choices.get(cert_mode, None)

    if cert_obj is not None:
        cert_obj.create()
        while True:
            # sleep for 12 hours before checking for renewal
            time.sleep(12 * 3600)
            cert_obj.renew()
    else:
        print(f"Cannot run {cert_mode} mode")
        sys.exit(99)
