#!/usr/bin/env python3
"""Invoke the configured certificate management policy."""


import os
import sys
import time
from typing import Dict, cast

from base_cert import BaseCert
from cert_proxy_server import CertProxyServer
from letsencrypt_cert import LetsEncryptCert
from self_signed_cert import SelfSignedCert
from utils import get_setting

if __name__ == "__main__":
    mode_choices: Dict[str, BaseCert] = {
        "self-signed": SelfSignedCert(),
        "letsencrypt": LetsEncryptCert(),
        "cert-server": CertProxyServer(),
    }

    cert_store = get_setting("CERT_STORE")
    for subdir in ("nginx", "selfsigned"):
        os.makedirs(f"{cert_store}/{subdir}", 0o755, True)

    cert_mode = cast(str, get_setting("CERT_MODE"))
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
        sys.exit(1)
