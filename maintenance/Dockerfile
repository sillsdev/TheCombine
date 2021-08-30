# Dockerfile to build a Combine Maintenance container.  The Maintenance image
# shall contain a collection of scripts to perform the following functions:
#  - backup The Combine database and backend data files
#  - restore The Combine database and backend data files from a previous backup
#
# The scripts are written in Python.

FROM sillsdev/aws-kubectl:0.1.9

USER root

RUN apt-get update && \
  apt-get install -y python3 python3-pip && \
  apt-get autoremove && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

USER user
WORKDIR /home/user

ENV PATH ${PATH}:/home/user/.local/bin

COPY requirements.txt .

RUN pip3 install -r requirements.txt

RUN mkdir -p .local/bin

COPY scripts/*.py ./.local/bin/
COPY scripts/*.sh ./.local/bin/
