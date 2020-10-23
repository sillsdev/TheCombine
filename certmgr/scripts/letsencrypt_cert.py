import os
from pathlib import Path
import time
from typing import List

from base_cert import BaseCert
from func import lookup_env, update_link
import requests
from self_signed_cert import SelfSignedCert


class LetsEncryptCert(BaseCert):
    def __init__(self) -> None:
        self.cert_store = lookup_env("CERT_STORE")
        self.server_name = lookup_env("SERVER_NAME")
        self.email = lookup_env("CERT_EMAIL")
        self.max_connect_tries = int(lookup_env("MAX_CONNECT_TRIES"))
        self.staging = True if lookup_env("CERT_STAGING") == "1" else False
        self.cert_dir = Path(f"/etc/letsencrypt/live/{self.server_name}")
        self.nginx_cert_dir = Path(f"{self.cert_store}/nginx/{self.server_name}")
        self.cert = Path(f"/etc/letsencrypt/live/{self.server_name}/fullchain.pem")

    # Method to create an SSL Certificate from Let's Encrypt
    # The method first creates a self-signed certificate and sets up a symbolic
    # link from the Nginx configured location to the self-signed certificate.
    # This allows the Nginx webserver to start.  Once Nginx is up, then the
    # certificate can be requested using the webroot authentication method.  If
    # this is successfull, then the symbolic link is moved to point to the
    # new certificate.
    # N O T E :
    # Nginx needs to be restarted/reloaded for it to use the new certificate.
    def create(self, force: bool = False) -> None:
        if force or not self.cert.exists():
            # Create a self-signed certificate so that the Nginx webserver can
            # come up and be available for the HTTP challenges from letsencrypt
            temp_cert = SelfSignedCert(1, 0)
            temp_cert.create()

        is_letsencrypt_cert = False
        if self.nginx_cert_dir.is_symlink():
            link_target = self.nginx_cert_dir.readlink()
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

            if not self.email:
                email_arg = "--register-unsafely-without-email"
            else:
                email_arg = "--email ${CERT_EMAIL}"

            staging_arg = "--staging" if self.staging else ""

            if domain_list:
                domain_args = "-d " + " -d ".join(domain_list)
                cert_cmd = (
                    f"certbot certonly --webroot -w /var/www/certbot "
                    f"{staging_arg} "
                    f"{email_arg} "
                    f"{domain_args} "
                    "--rsa-key-size 4096 "
                    "--agree-tos "
                    "--non-interactive "
                )
                certbot_result = os.system(cert_cmd)
                if certbot_result == 0:
                    update_link(self.cert_dir, self.nginx_cert_dir)

    # Calls "certbot renew" to renew all letsencrypt certificates that are
    # up for renewal.
    def renew(self) -> None:
        os.system("certbot renew")

    # wait_for_webserver will wait until the Nginx webserver has started.  This
    # is done by periodically sending an http request to our URL and waiting for
    # a response of 200 (OK) or 301 (Redirected).  We do not allow redirects nor
    # do we send an https request because the webserver is started up with a
    # self-signed certificate which will cause an error in these cases
    def wait_for_webserver(self) -> bool:
        attempt_count = 0
        while attempt_count < self.max_connect_tries:
            try:
                # Don't allow redirect errors since letsencrypt connects
                # on port 80 and since we have a self-signed cert for now
                # it will cause errors
                r: requests.Response = requests.get(
                    f"http://{self.server_name}", allow_redirects=False
                )
            except requests.ConnectionError:
                attempt_count += 1
            else:
                if r.status_code in (200, 301):
                    return True
                else:
                    attempt_count += 1
            time.sleep(10)
        return False
