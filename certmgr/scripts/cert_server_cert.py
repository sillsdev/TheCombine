"""
CertServer certificate module.

The CertServerCert derives from LetsEncryptCert.  In addition to performing the
role of LetsEncryptCert, it also acts as a proxy for the roaming servers, e.g.
the NUCs, by fetching their certificates pushing them to an AWS S3 Bucket.
"""

from pathlib import Path

from letsencrypt_cert import LetsEncryptCert


class CertServerCert(LetsEncryptCert):
    """
    Manage certificates for the server and provice proxy certificate services.

    CertServerCert is a kind of LetsEncryptCert object that uses the base class
    functionality to manage its own certificate and, in addition, acts as a proxy
    for servers that are not reachable from the internet.  As a proxy, it creates
    certificates for these servers and pushes them to an Amazon Web Services S3
    bucket.
    """

    def __init__(self):
        """Initialize CertServerCert instance."""
        super().__init__()
        self.cert_renew_deploy_hook = Path("/etc/letsencrypt/renewal/deploy/10_push_certs.sh")

    def create(self, force: bool = False) -> None:
        """
        Create own certificate and proxy certificates.

        Create certificate for this server and then create certificates for the
        servers listed in the CERT_PROXY_DOMAINS environment variable.  The proxy
        certificates are then pushed to the AWS S3 certificate bucket.
        """
        super().create(force)
        print(f"Called CertServerCert.create({force})")
