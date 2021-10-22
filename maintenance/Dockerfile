# Dockerfile to build a Kubernetes Worker container for the Combine.  The
# image shall contain a collection of scripts to perform the following functions:
#  - backup The Combine database and backend data files
#  - restore The Combine database and backend data files from a previous backup
#  - monitor specified secrets for changes and push the updated secrets to AWS
#    S3 storage
#  - check the current TLS secret for updates in AWS S3 storage and update the
#    secret accordingly.
# The scripts are written in Python.

FROM sillsdev/aws-kubectl:0.1.9

USER root

RUN apt-get update && \
  apt-get install -y python3 python3-pip nano && \
  apt-get autoremove && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Create a 'user' user so the program doesn't run as root.
ENV HOME=/home/user
RUN groupadd -r user && \
  useradd -r -g user -d $HOME -s /sbin/nologin -c "Docker image user" app

USER user
WORKDIR ${HOME}

ENV PATH ${PATH}:${HOME}/.local/bin

COPY requirements.txt .

RUN pip3 install -r requirements.txt

RUN mkdir -p .local/bin

COPY --chown=user:user scripts/*.py ./.local/bin/
COPY --chown=user:user scripts/*.sh ./.local/bin/
