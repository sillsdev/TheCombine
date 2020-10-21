#! /usr/bin/env python3

import os
import time
from typing import List

from basecert import BaseCert
from func import lookup_env, update_link
import requests
from selfsignedcert import SelfSignedCert


class LetsEncryptCert(BaseCert):
    def __init__(self):
        self.cert_store: str = lookup_env("CERT_STORE")
        self.server_name: str = lookup_env("SERVER_NAME")
        self.email: str = lookup_env("CERT_EMAIL")
        self.max_connect_tries: int = int(lookup_env("MAX_CONNECT_TRIES"))
        self.staging: bool = True if lookup_env("CERT_STAGING") == "1" else False
        self.cert_dir: str = f"/etc/letsencrypt/live/{self.server_name}"
        self.nginx_cert_dir: str = f"{self.cert_store}/nginx/{self.server_name}"
        self.cert: str = f"/etc/letsencrypt/live/{self.server_name}/fullchain.pem"
        self.privkey: str = f"{self.cert_store}/selfsigned/{self.server_name}/privkey.pem"

    def create(self, force: bool = False):
        if force or not os.path.exists(self.cert):
            temp_cert = SelfSignedCert(1, 0)
            temp_cert.create()

        is_letsencrypt_cert: bool = False
        if os.path.islink(self.nginx_cert_dir):
            link_target: str = os.readlink(self.nginx_cert_dir)
            if link_target == self.cert_dir:
                is_letsencrypt_cert = True

        if not is_letsencrypt_cert:
            print("Waiting for webserver to come up")
            if not self.wait_for_webserver():
                print("Could not connect to webserver")
                return

            # Get additional variables for certbot
            domain_list: List[str] = [self.server_name]
            domain_list.extend(lookup_env("CERT_DOMAINS").split())

            email_arg: str = ""
            if not self.email:
                email_arg = "--register-unsafely-without-email"
            else:
                email_arg = "--email ${CERT_EMAIL}"

            staging_arg: str = "--staging" if self.staging else ""

            if domain_list:
                domain_args: str = "-d " + " -d ".join(domain_list)
                cert_cmd: str = (
                    f"certbot certonly --webroot -w /var/www/certbot "
                    f"{staging_arg} "
                    f"{email_arg} "
                    f"{domain_args} "
                    "--rsa-key-size 4096 "
                    "--agree-tos "
                    "--non-interactive "
                )
                certbot_result: int = os.system(cert_cmd)
                if certbot_result == 0:
                    update_link(self.cert_dir, self.nginx_cert_dir)

    def renew() -> None:
        os.system("certbot renew")

    def wait_for_webserver(self) -> bool:
        attempt_count: int = 0
        while attempt_count < self.max_connect_tries:
            try:
                r: requests.Response = requests.get(
                    f"http://{self.server_name}", allow_redirects=False
                )
            except requests.ConnectionError:
                attempt_count += 1
            else:
                if r.status_code == 200 or r.status_code == 301:
                    return True
                else:
                    attempt_count += 1
            time.sleep(10)
        return False
