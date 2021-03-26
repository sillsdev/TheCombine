"""
CertClient certificate module.

The CertProxyClient derives from LetsEncryptCert.  It fetches its certificate from
the configured AWS S3 Bucket.
"""

from datetime import datetime, timedelta
from enum import Enum, auto
from pathlib import Path
import re
import subprocess
from typing import Optional

from aws import aws_s3_get
from base_cert import BaseCert
from utils import get_setting, is_reachable, update_link


class CertState(Enum):
    """Define enumeration for recognized certificate states."""

    Missing = auto()
    Error = auto()
    Expired = auto()
    Renewable = auto()
    Ready = auto()


class CertProxyClient(BaseCert):
    """
    Fetch and maintain an SSL certificate stored in an AWS S3 bucket.

    CertProxyClient that fetches an SSL certificate that was created for the
    client by a CertProxyServer instance and stored in an AWS S3 bucket.
    """

    def __init__(self) -> None:
        """Initialize CertProxyClient instance."""
        self.cert_store = get_setting("CERT_STORE")
        self.server_name = get_setting("SERVER_NAME")
        self.cert_dir = Path(f"{self.cert_store}/aws/{self.server_name}")
        self.nginx_cert_dir = Path(f"{self.cert_store}/nginx/{self.server_name}")
        self.cert = Path(f"{self.cert_dir}/fullchain.pem")
        self.renew_before_expiry = int(get_setting("CERT_SELF_RENEWAL"))

    def get_time_to_expire(self) -> Optional[timedelta]:
        """
        Calculate the time to expiration for a certificate.

        returns -- a datetime.timedelta structure that indicates the time until
                   the certificate expires.
        """
        try:
            results = subprocess.run(
                ["openssl", "x509", "-enddate", "-noout", "-in", self.cert],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True,
                check=True,
            )
            # extract the expiration time string
            match = re.match(r"notAfter=(.*)\n", results.stdout)
            if match:
                expires_str = match.group(1)
                # convert to a datetime object
                expires_dt = datetime.strptime(expires_str, "%b %d %H:%M:%S %Y %Z")
                return expires_dt - datetime.now()
            return None
        except subprocess.CalledProcessError as err:
            print(f"CalledProcessError returned {err.returncode}")
            print(f"stdout: {err.stdout}")
            print(f"stderr: {err.stderr}")
            return None

    def get_cert_state(self) -> CertState:
        """
        Lookup the state of the current certificate.

        Lookup the state of the current certificate - see CertState enumeration
        above for possible values.
        """
        if not self.cert_dir.exists() or not self.cert.exists():
            print("No certificate found.")
            return CertState.Missing
        time_to_expire = self.get_time_to_expire()
        if time_to_expire is None:
            print("Cannot get expiration time for existing certificate")
            return CertState.Error
        if time_to_expire.days < 0:
            print(f"Certificate expired {-time_to_expire.days} ago.")
            return CertState.Expired
        if time_to_expire.days < self.renew_before_expiry:
            print(f"Certificate expires in {time_to_expire.days} days.")
            return CertState.Renewable
        print(f"Certificate expires in {time_to_expire.days} days - no action.")
        return CertState.Ready

    def fetch_certificates(self) -> bool:
        """Fetch the certificate files from AWS S3 service."""
        # First test to see if we have an internet connection
        if not is_reachable("https://aws.amazon.com/", True):
            return False
        cert_file_list = ("cert.pem", "chain.pem", "fullchain.pem", "privkey.pem")

        self.cert_dir.mkdir(0o755, parents=True, exist_ok=True)
        for cert_file in cert_file_list:
            if not aws_s3_get(
                f"{self.server_name}/{cert_file}", Path(f"{self.cert_dir}/{cert_file}")
            ):
                return False
        return True

    def create(self) -> None:
        """
        Fetch the proxy certificate for this server from the AWS S3 Bucket.

        Fetches the proxy certificate that was created for this server by an
        instance of CertProxyServer.  This requires that the server be on a
        network that can reach the AWS S3 service to fetch the initial
        certificate.
        """
        self.renew()

    def renew(self) -> None:
        """Renew the certificate from the AWS S3 bucket."""
        cert_state = self.get_cert_state()
        if cert_state is not CertState.Ready:
            if self.fetch_certificates():
                update_link(self.cert_dir, self.nginx_cert_dir)
