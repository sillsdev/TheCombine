import os
from pathlib import Path
import time
from typing import Final, List

from base_cert import BaseCert
from utils import lookup_default, lookup_env, update_link
import requests
from self_signed_cert import SelfSignedCert


class LetsEncryptCert(BaseCert):

    cert_renew_deploy_hook: Final = "/etc/letsencrypt/renewal/deploy/10_push_certs.sh"

    def __init__(self) -> None:
        self.cert_store = lookup_env("CERT_STORE")
        self.server_name = lookup_env("SERVER_NAME")
        self.email = lookup_env("CERT_EMAIL")
        self.max_connect_tries = int(lookup_env("MAX_CONNECT_TRIES"))
        self.staging = True if lookup_env("CERT_STAGING") == "1" else False
        self.cert_dir = Path(f"/etc/letsencrypt/live/{self.server_name}")
        self.nginx_cert_dir = Path(f"{self.cert_store}/nginx/{self.server_name}")
        self.cert = Path(f"/etc/letsencrypt/live/{self.server_name}/fullchain.pem")
        self.renew_before_expiry: int = lookup_env("CERT_PROXY_RENEWAL")

    def create(self, force: bool = False) -> None:
        """
        Method to create an SSL Certificate from Let's Encrypt

        The method first creates a self-signed certificate and sets up a symbolic
        link from the Nginx configured location to the self-signed certificate.
        This allows the Nginx webserver to start.  Once Nginx is up, then the
        certificate can be requested using the webroot authentication method.  If
        this is successfull, then the symbolic link is moved to point to the
        new certificate.
        N O T E :
        Nginx needs to be restarted/reloaded for it to use the new certificate.
        """
        if force or not self.cert.exists():
            # Create a self-signed certificate so that the Nginx webserver can
            # come up and be available for the HTTP challenges from letsencrypt
            temp_cert = SelfSignedCert(1, 0)
            temp_cert.create()

        # Check to see if we have a certificate from Let's Encrypt by seeing
        # the the Nginx webserver is configured to use a certificate in
        # the folder where the letsencrypt certificates are stored.
        # It does NOT verify that the certificate exists.
        is_letsencrypt_cert = False
        if self.nginx_cert_dir.is_symlink():
            link_target = os.readlink(self.nginx_cert_dir)
            if link_target == self.cert_dir:
                is_letsencrypt_cert = True

        # if we do not have a certificate from letsncrypt, then we:
        #  1. wait for the webserver to come up since we use the webroot
        #     challenge method;
        #  2. request a certificate from Let's Encrypt using certbot
        #  3. update the Nginx configuration to use the new certificate.
        if not is_letsencrypt_cert:
            print("Waiting for webserver to come up")
            if not self.wait_for_webserver():
                print("Could not connect to webserver")
                return

            # Get additional variables for certbot
            domain_list: List[str] = [self.server_name]
            domain_list.extend(lookup_env("CERT_ADDL_DOMAINS").split())

            if self.get_cert(domain_list):
                # update the certificate link for the Nginx web server
                update_link(self.cert_dir, self.nginx_cert_dir)
        # Next we check to see if the LetsEcryptCert object is also acting as
        # a proxy to create certificates for servers that are not reachable
        cert_proxy_list = lookup_env

    def renew(self) -> None:
        """ Renew all letsencrypt certificates that are up for renewal """
        os.system("certbot renew")

    def get_cert(self, domain_list: List[str]) -> bool:
        """
        Get a certificate for all the domains in the supplied list.

        Get a single certificate that can be used for a list of domains.  The
        first domain in the list is the 
        """
        if domain_list:
            domain_args: str = "-d " + " -d ".join(domain_list)

            if not self.email:
                email_arg = "--register-unsafely-without-email"
            else:
                email_arg = f"--email {self.email}"

            staging_arg = "--staging" if self.staging else ""

            cert_cmd: str = (
                f"certbot certonly --webroot -w /var/www/certbot "
                f"{staging_arg} "
                f"{email_arg} "
                f"{domain_args} "
                "--rsa-key-size 4096 "
                "--agree-tos "
                "--non-interactive "
            )
            return os.system(cert_cmd) == 0
        else:
            return False

    def wait_for_webserver(self) -> bool:
        """
        Wait until Nginx webserver is up

        wait_for_webserver will wait until the Nginx webserver has started.  This
        is done by periodically sending an http request to our URL and waiting for
        a response of 200 (OK) or 301 (Redirected).  We do not allow redirects nor
        do we send an https request because the webserver is started up with a
        self-signed certificate which will cause an error in these cases
        """
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

    def update_renew_before_expiry(self, domain: str) -> None:
        if lookup_default("CERT_PROXY_RENEWAL") != self.renew_before_expiry:
            print(
                f"Setting renew before expiry for {domain} " f"to {self.renew_before_expiry}"
            )
            renew_config: str = f"/etc/letsencrypt/renewal/{domain}.conf"
            if os.path.exists(renew_config):
                os.system(
                    "sed -s 's/#* *renew_before_expiry = [0-9][0-9]* days/"
                    f"renew_before_expiry = {self.renew_before_expiry} days' "
                    f" < renew_config > '{renew_config}.tmp'"
                )
                os.system(f"mv {renew_config}.tmp {renew_config}")

    def create_renew_hook(self) -> None:
        print("STUB: Create renew hook")

    def get_proxy_certs(self) -> None:
        domain_list: List[str] = lookup_env("CERT_PROXY_DOMAINS").split()
        cert_created: bool = False
        for domain in domain_list:
            if self.get_cert([domain]):
                cert_created = True
                self.update_renew_before_expiry(domain)
            else:
                print(f"Could not get certificate for {domain}")
        if cert_created:
            self.create_renew_hook()
            self.push_certs_to_aws_s3()

    def push_certs_to_aws_s3(self) -> None:
        print("STUB: Push certificates to AWS S3 bucket")
