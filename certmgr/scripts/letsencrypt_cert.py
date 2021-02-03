"""
Manage certificates from Let's Encrypt.

LetsEncryptCert will create a certificate from letsencrypt to be used by the
associated webserver.  LetsEncryptCert uses the http challenge method and it
assumes that there is a web server available for the challenge.  It shares a
volume for the certbot data as well as the letsencrypt certificates.
"""
import os
from pathlib import Path
import time
from typing import List, cast

from base_cert import BaseCert
import requests
from self_signed_cert import SelfSignedCert
from utils import get_setting, update_link


class LetsEncryptCert(BaseCert):
    """SSL Certificate class to create and renew certs from Let's Encrypt."""

    LETSENCRYPT_DIR = Path("/etc/letsencrypt")

    def __init__(self) -> None:
        """Initialize class from environment variables."""
        # pylint: disable=too-many-instance-attributes
        # Ten are required in this case.
        self.cert_store = cast(str, get_setting("CERT_STORE"))
        self.server_name = cast(str, get_setting("SERVER_NAME"))
        self.email = cast(str, get_setting("CERT_EMAIL"))
        self.max_connect_tries: int = int(get_setting("MAX_CONNECT_TRIES"))
        self.staging = get_setting("CERT_STAGING") != "0"
        self.cert_dir = Path(f"{LetsEncryptCert.LETSENCRYPT_DIR}/live/{self.server_name}")
        self.nginx_cert_dir = Path(f"{self.cert_store}/nginx/{self.server_name}")
        self.cert = Path(f"{self.cert_dir}/fullchain.pem")
        self.renew_before_expiry = cast(int, get_setting("CERT_SELF_RENEWAL"))

    @staticmethod
    def update_renew_before_expiry(domain: str, renew_before_expiry_period: int) -> None:
        """Update the RENEW_BEFORE_EXPIRY configuration value for 'domain'."""
        renew_before_expiry = str(renew_before_expiry_period)
        renew_config = f"{LetsEncryptCert.LETSENCRYPT_DIR}/renewal/{domain}.conf"
        if os.path.exists(renew_config):
            os.system(
                "sed -i 's/#* *renew_before_expiry = [0-9][0-9]* days/"
                f"renew_before_expiry = {renew_before_expiry} days/' "
                f" {renew_config}"
            )

    def create(self) -> None:
        """
        Create an SSL Certificate from Let's Encrypt.

        The method first creates a self-signed certificate and sets up a symbolic
        link from the Nginx configured location to the self-signed certificate.
        This allows the Nginx webserver to start.  Once Nginx is up, then the
        certificate can be requested using the webroot authentication method.  If
        this is successful, then the symbolic link is moved to point to the
        new certificate.
        NOTE:
        Nginx needs to be restarted/reloaded for it to use the new certificate.
        """
        if not self.cert.exists():
            # Create a self-signed certificate so that the Nginx webserver can
            # come up and be available for the HTTP challenges from letsencrypt
            temp_cert = SelfSignedCert(expire=1, renew_before_expiry=0)
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
            if not self.wait_for_webserver():
                print("Could not connect to webserver")
                return

            # Get additional variables for certbot
            domain_list: List[str] = [self.server_name]
            domain_list.extend(cast(str, get_setting("CERT_ADDL_DOMAINS")).split())

            if self.get_cert(domain_list):
                # update the certificate link for the Nginx web server
                update_link(self.cert_dir, self.nginx_cert_dir)
            LetsEncryptCert.update_renew_before_expiry(self.server_name, self.renew_before_expiry)

    def renew(self) -> None:
        """Renew all letsencrypt certificates that are up for renewal."""
        os.system("certbot renew")

    def get_cert(self, domain_list: List[str]) -> bool:
        """
        Get a certificate for all the domains in the supplied list.

        Get a single certificate that can be used for a list of domains.  The
        first domain in the list is the
        """
        if domain_list is not None:
            domain_args = f"-d {' -d '.join(domain_list)}"

            if not self.email:
                email_arg = "--register-unsafely-without-email"
            else:
                email_arg = f"--email {self.email}"

            staging_arg = "--staging" if self.staging else ""

            cert_cmd = (
                f"certbot certonly --webroot -w /var/www/certbot "
                f"{staging_arg} "
                f"{email_arg} "
                f"{domain_args} "
                "--rsa-key-size 4096 "
                "--agree-tos "
                "--non-interactive "
            )
            return os.system(cert_cmd) == 0
        return False

    def wait_for_webserver(self) -> bool:
        """
        Wait until Nginx webserver is up.

        wait_for_webserver will wait until the Nginx webserver has started.  This
        is done by periodically sending an http request to our URL and waiting for
        a response of 200 (OK) or 301 (Redirected).  We do not allow redirects nor
        do we send an https request because the webserver is started up with a
        self-signed certificate which will cause an error in these cases.
        """
        attempt_count = 0
        while attempt_count < self.max_connect_tries:
            try:
                # Don't allow redirect errors since letsencrypt connects
                # on port 80 and since we have a self-signed cert for now
                # it will cause errors
                resp: requests.Response = requests.get(
                    f"http://{self.server_name}", allow_redirects=False
                )
            except requests.ConnectionError:
                attempt_count += 1
            else:
                if resp.status_code in (200, 301):
                    return True
                attempt_count += 1
            time.sleep(10)
        return False
