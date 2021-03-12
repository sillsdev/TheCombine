# Dockerfile to build a Certificate Manager container.  The certificate manager
# shall generate self-signed certificates and/or it shall use certbot to get
# certificates from letsencrypt.
#
# The certmgr may also be configured to push some of its certificates to an
# Amazon Web Services S3 bucket for use by devices that need a certificate when
# an internet connection is not always available.
#
# The container's entrypoint function and the modules that it calls are written
# in Python.  The Python modules use the following modules that are not explicitly
# installed since they are currently installed with certbot:
#  - requests
#  - openssl


FROM debian:buster

RUN apt-get update && \
    apt-get install -y apt-utils curl certbot zip procps && \
    apt-get autoremove && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    curl -sL https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o awscliv2.zip && \
    unzip awscliv2.zip && \
    aws/install && \
    rm -rf awscliv2.zip \
        aws \
        /usr/local/aws-cli/v2/*/dist/aws_completer \
        /usr/local/aws-cli/v2/*/dist/awscli/data/ac.index \
        /usr/local/aws-cli/v2/*/dist/awscli/examples

RUN mkdir -p /opt/certmgr

WORKDIR /opt/certmgr

COPY scripts/*.py ./

ENTRYPOINT ["./entrypoint.py"]
