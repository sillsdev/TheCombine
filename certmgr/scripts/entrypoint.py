#!/usr/bin/env python3
"""Invoke the configured certificate management policy."""


import os
import signal
import sys
import types
from typing import Dict

from base_cert import BaseCert
from cert_proxy_client import CertProxyClient
from cert_proxy_server import CertProxyServer
from letsencrypt_cert import LetsEncryptCert
from self_signed_cert import SelfSignedCert
from utils import get_setting


def handle_user_sig1(signum: int, frame: types.FrameType) -> None:
    """
    Handle the SIGUSR1 signal.

    This function is a no-op since the purpose of the signal is to allow asynchronouse
    checking of the certificate(s) for renewal.  This handler is used to replace
    the default handler.
    """
    print(f"Signal handler for {signum} called")


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

    cert_mode = get_setting("CERT_MODE")
    print(f"Running in {cert_mode} mode")
    cert_obj = mode_choices.get(cert_mode, None)

    if cert_obj is not None:
        cert_obj.create()
        # The certmgr will respond to the SIGUSR1 signal by checking for certificate
        # renewal ahead of the scheduled time.  The initial use for this is to
        # allow the NUC to trigger the certmgr (running in "cert-client" mode) to
        # check for an updated certificate when it detects that the wired ethernet
        # connection is up.
        usr1_signal = signal.SIGUSR1
        signal.signal(usr1_signal, handle_user_sig1)
        while True:
            # check for renewal after 12 hours or SIGUSR1 received
            got_sig = signal.sigtimedwait([usr1_signal], 12 * 3600)  # (12 hrs x 3600 sec/hr)
            if got_sig is not None:
                print(f"Renew triggered by signal ({got_sig.si_signo}).")
            cert_obj.renew()
    else:
        print(f"Cannot run {cert_mode} mode")
        sys.exit(1)


if __name__ == "__main__":
    main()
