#!/usr/bin/env python3
"""
Check the expiration time of the TLS secret and update if needed.

check_cert.py will update the current certificate for the NUC from the secret stored
in the AWS_S3_BUCKET.  It will update the certificate under the following
conditions:
 - the NUC is connected to the Internet
 - there are less than CERT_RENEW_BEFORE_EXPIRY days left on the current
   certificate
"""


def main() -> None:
    print("TO DO: create tls secret for NUC")


if __name__ == "__main__":
    main()
