#! /usr/bin/env python3

import os
import sys

from basecert import BaseCert
from func import *


class SelfSignedCert(BaseCert):
    def __init__(self, expire: int = 365, renew_before_expiry: int = 10):
        self.cert_store: str = lookup_env("CERT_STORE")
        self.server_name: str = lookup_env("SERVER_NAME")
        self.expire: int = expire  # days
        self.renew_before_expiry: int = renew_before_expiry  # days
        self.cert_dir: str = f"{self.cert_store}/selfsigned/{self.server_name}"
        self.nginx_cert_dir: str = f"{self.cert_store}/nginx/{self.server_name}"
        self.cert: str = f"{self.cert_store}/selfsigned/{self.server_name}/fullchain.pem"
        self.privkey: str = f"{self.cert_store}/selfsigned/{self.server_name}/privkey.pem"

    def create(self, force: bool = False) -> None:
        if force or not os.path.exists(self.cert):
            os.makedirs(self.cert_dir, 0o755, True)
            os.system(
                f"openssl req -x509 -nodes -newkey rsa:4096 -days {self.expire} -keyout '{self.privkey}' -out '{self.cert}' -subj '/CN=localhost'"
            )
            update_link(self.cert_dir, self.nginx_cert_dir)

    def renew(self) -> None:
        self.debug_log(f"Checking for renewal of {self.cert}")
        renew_before_expiry_sec = self.renew_before_expiry * 3600 * 24
        if os.path.exists(self.cert_file):
            wstat: int = os.system(
                f"openssl x509 -noout -in {self.cert_file} -checkend {renew_before_expiry_sec} > /dev/null"
            )
            if os.waitstatus_to_exitcode(wstat) == 1:
                print(f"Renewing the certificates for {self.server_name}")
                self.create(True)
        else:
            print(f"Restoring the certificate for {self.server_name}")
