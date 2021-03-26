"""
SelfSignedCert certificate module.

The SelfSignedCert creates a Self-Signed certificate that can be used:
  1. as a temporary certificate so that NGINX will stay up while Let's Encrypt
     performs an HTTP challenge; or
  2. for servers for testing that are not reachable by Let's Encrypt.
"""

import os
from pathlib import Path

from base_cert import BaseCert
from utils import get_setting, update_link


class SelfSignedCert(BaseCert):
    """Class for a Self-Signed SSL certificate."""

    def __init__(self, *, expire: int = 365, renew_before_expiry: int = 10) -> None:
        """Construct a Self-Signed Certificate object."""
        # pylint: disable=too-many-instance-attributes
        # Eight are required in this case.

        self.cert_store = get_setting("CERT_STORE")
        self.server_name = get_setting("SERVER_NAME")
        self.expire = expire  # days
        self.renew_before_expiry = renew_before_expiry  # days
        self.cert_dir = Path(f"{self.cert_store}/selfsigned/{self.server_name}")
        self.nginx_cert_dir = Path(f"{self.cert_store}/nginx/{self.server_name}")
        self.cert = Path(f"{self.cert_store}/selfsigned/{self.server_name}/fullchain.pem")
        self.privkey = Path(f"{self.cert_store}/selfsigned/{self.server_name}/privkey.pem")

    def create(self) -> None:
        """
        Create a self-signed certificate.

        Create a self-signed certificate and then link the Nginx directory for its
        certificate to the directory where the certs are created.
        """
        if not self.cert.exists():
            self.cert_dir.mkdir(0o755, parents=True)
            os.system(
                f"openssl req "
                "-x509 "
                "-nodes "
                "-newkey "
                "rsa:4096 "
                f"-days {self.expire} "
                f"-keyout '{self.privkey}' "
                f"-out '{self.cert}' "
                "-subj '/CN=localhost'"
            )
            update_link(self.cert_dir, self.nginx_cert_dir)

    def renew(self) -> None:
        """
        Renew a Self-Signed certificate.

        Checks to see if the self-signed certificate will expire with in the
        "renew_before_expiry" time (in days).  If it will, a new self-signed
        certificate is created to replace the current certificate
        """
        renew_before_expiry_sec = self.renew_before_expiry * 3600 * 24
        if self.cert.exists():
            ret_code = os.system(
                "openssl x509 "
                "-noout "
                f"-in {self.cert} "
                f"-checkend {renew_before_expiry_sec} "
                "> /dev/null"
            )
            if ret_code == 1:
                print(f"Renewing the certificates for {self.server_name}")
                self.create()
        else:
            print(f"Restoring the certificate for {self.server_name}")
