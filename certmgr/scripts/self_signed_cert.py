import os
from pathlib import Path

from base_cert import BaseCert
from utils import lookup_env, update_link


class SelfSignedCert(BaseCert):
    def __init__(self, expire: int = 365, renew_before_expiry: int = 10) -> None:
        self.cert_store = lookup_env("CERT_STORE")
        self.server_name = lookup_env("SERVER_NAME")
        self.expire = expire  # days
        self.renew_before_expiry = renew_before_expiry  # days
        self.cert_dir = Path(f"{self.cert_store}/selfsigned/{self.server_name}")
        self.nginx_cert_dir = Path(f"{self.cert_store}/nginx/{self.server_name}")
        self.cert = Path(f"{self.cert_store}/selfsigned/{self.server_name}/fullchain.pem")
        self.privkey = Path(f"{self.cert_store}/selfsigned/{self.server_name}/privkey.pem")

    def create(self, force: bool = False) -> None:
        """
        Create a self-signed certificate

        Create a self-signed certificate and then link the Nginx directory for its
        certificate to the directory where the certs are created.
        """
        if force or not self.cert.exists():
            self.cert_dir.mkdir(0o755, True)
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
        Renew a Self-Signed certificate

        Checks to see if the self-signed certificate will expire with in the
        "renew_before_expiry" time (in days).  If it will, a new self-signed
        certificate is created to replace the current certificate
        """
        renew_before_expiry_sec = self.renew_before_expiry * 3600 * 24
        if self.cert.exists():
            wstat = os.system(
                "openssl x509 "
                "-noout "
                f"-in {self.cert} "
                f"-checkend {renew_before_expiry_sec} "
                "> /dev/null"
            )
            if os.waitstatus_to_exitcode(wstat) == 1:
                print(f"Renewing the certificates for {self.server_name}")
                self.create(True)
        else:
            print(f"Restoring the certificate for {self.server_name}")
