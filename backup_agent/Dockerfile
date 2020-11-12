# Dockerfile to build a container for the Combine Database.  The database
# container consists of the basic mongo:4.2 image and scripts to backup and
# restore the CombineDatabase and supporting files from the Combine Backend


FROM ubuntu:bionic

# Import public key for Mongodb.org
RUN apt-get update && \
    apt-get install -y wget gnupg && \
    wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | apt-key add - && \
    echo "deb  https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" > /etc/apt/sources.list.d/mongodb-org-4.2.list && \
    apt-get update && \
    apt-get install -y apt-utils curl mongodb-org-tools zip && \
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

RUN mkdir -p /opt/combine

COPY scripts/*.sh /opt/combine/
