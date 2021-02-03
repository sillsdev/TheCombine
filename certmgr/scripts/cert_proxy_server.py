"""
CertServer certificate module.

The CertProxyServer derives from LetsEncryptCert.  In addition to performing the
role of LetsEncryptCert, it also acts as a proxy for the roaming servers, e.g.
the NUCs, by fetching their certificates and pushing them to an AWS S3 Bucket.
"""


from pathlib import Path
from typing import cast

from aws import aws_push_certs
from letsencrypt_cert import LetsEncryptCert
from utils import get_setting, update_link


class CertProxyServer(LetsEncryptCert):
    """
    Manage certificates for the server and provice proxy certificate services.

    CertProxyServer is a kind of LetsEncryptCert object that uses the base class
    functionality to manage its own certificate and, in addition, acts as a proxy
    for servers that are not reachable from the internet.  As a proxy, it creates
    certificates for these servers and pushes them to an Amazon Web Services S3
    bucket.
    """

    def __init__(self) -> None:
        """Initialize CertProxyServer instance."""
        super().__init__()
        self.renew_before_expiry = cast(int, get_setting("CERT_PROXY_RENEWAL"))

    def create(self) -> None:
        """
        Create own certificate and proxy certificates.

        Create certificate for this server and then create certificates for the
        servers listed in the CERT_PROXY_DOMAINS environment variable.  The proxy
        certificates are then pushed to the AWS S3 certificate bucket.
        """
        super().create()
        self.get_proxy_certs()

    def get_proxy_certs(self) -> None:
        """
        Get certificates for all proxy domains.

        For each domain listed in the CERT_PROXY_DOMAINS environment variable:
         - generate an SSL certificate from Let's Encrypt
         - configure the "renew before expiry" period to be the time specified
           in the CERT_PROXY_RENEWAL environment variable. (Note that all proxy
           certificates have the same renewal period).
         - copy the certificate files to the AWS S3 service.  The following
           objects are saved in the S3 bucket:
             * ${AWS_S3_CERT_LOC}/{domain}/cert.pem
             * ${AWS_S3_CERT_LOC}/{domain}/chain.pem
             * ${AWS_S3_CERT_LOC}/{domain}/fullchain.pem
             * ${AWS_S3_CERT_LOC}/{domain}/privkey.pem
           where ${AWS_S3_CERT_LOC} is the environment variable that specifies
           the S3 bucket to use; {domain} is the individual domain from the
           CERT_PROXY_DOMAINS variable.
        """
        domain_list = cast(str, get_setting("CERT_PROXY_DOMAINS")).split()
        cert_created = False
        for domain in domain_list:
            if self.get_cert([domain]):
                cert_created = True
                LetsEncryptCert.update_renew_before_expiry(domain, self.renew_before_expiry)
            else:
                print(f"Could not get certificate for {domain}")
        if cert_created:
            CertProxyServer.create_renew_hook()
            aws_push_certs()

    @staticmethod
    def create_renew_hook() -> None:
        """
        Create hook for certificate renewal.

        Add a hook function to push new certificates to the AWS S3 bucket when
        the proxy certificates are renewed.
        """
        renew_hook = Path(
            f"{LetsEncryptCert.LETSENCRYPT_DIR}/renewal-hooks/deploy/01_hook_push_certs_to_aws"
        )
        cert_renew_hook_src = Path("/opt/certmgr/cert_renewal_hook.py")
        update_link(cert_renew_hook_src, renew_hook)
