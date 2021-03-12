#!/usr/bin/env python3
"""Invoke the configured certificate management policy."""


import os
import signal
import sys
from typing import Dict, cast

from base_cert import BaseCert
from cert_proxy_client import CertProxyClient
from cert_proxy_server import CertProxyServer
from letsencrypt_cert import LetsEncryptCert
from self_signed_cert import SelfSignedCert
from utils import get_setting


def handle_user_sig1():
    """
    Handle the signal sent when Ethernet detected.

    This function is a no-op since the purpose of the signal is to terminate the
    timeout until the next time to check renewal.  This handler is used to replace
    the default handler.
    """
    print("Ethernet connection detected.")


def main() -> None:
    """Run the main processing loop for the certmgr instance."""
    mode_choices: Dict[str, BaseCert] = {
        "self-signed": SelfSignedCert(),
        "letsencrypt": LetsEncryptCert(),
        "cert-server": CertProxyServer(),
        "cert-client": CertProxyClient(),
    }

    cert_store = get_setting("CERT_STORE")
    for subdir in ("nginx", "selfsigned"):
        os.makedirs(f"{cert_store}/{subdir}", 0o755, True)

    cert_mode = cast(str, get_setting("CERT_MODE"))
    print(f"Running in {cert_mode} mode")
    cert_obj = mode_choices.get(cert_mode, None)

    if cert_obj is not None:
        cert_obj.create()
        usr1_signal = signal.SIGUSR1
        signal.signal(usr1_signal, handle_user_sig1)
        while True:
            # check for renewal after 12 hours or SIGUSR1 received
            got_sig = signal.sigtimedwait([usr1_signal], 60*12)
            if got_sig is not None:
                print(f"Renew triggered by signal ({got_sig.si_signo}).")
            cert_obj.renew()
    else:
        print(f"Cannot run {cert_mode} mode")
        sys.exit(1)


if __name__ == "__main__":
    main()
