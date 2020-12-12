#!/usr/bin/env python3
"""Push updated certificates to AWS S3 bucket."""


from aws import aws_push_certs

if __name__ == "__main__":
    aws_push_certs()
