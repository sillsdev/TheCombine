# Dockerfile to build a Kubernetes Worker container for the Combine.  The
# image shall contain a collection of scripts to perform the following functions:
#  - backup The Combine database and backend data files
#  - restore The Combine database and backend data files from a previous backup
#  - monitor specified secrets for changes and push the updated secrets to AWS
#    S3 storage
#  - check the current TLS secret for updates in AWS S3 storage and update the
#    secret accordingly.
# The scripts are written in Python.

FROM sillsdev/aws-kubectl:0.3.0@sha256:63b6f2b30119fa9c27a99a38309a4599aefe10d175fb801d51da26f13099a825

USER root

RUN apt-get update && \
  apt-get install -y python3 python3-pip nano && \
  apt-get autoremove && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Use 'user' user (in sillsdev/aws-kubectl image) so the program
# doesn't run as root.
ENV HOME=/home/user
ENV SCRIPT_DIR=${HOME}/.local/bin
ENV FONT_DIR=/var/local/fonts

RUN mkdir -p ${FONT_DIR}
RUN chown user:user ${FONT_DIR}

# switch to non-root user
USER user
WORKDIR ${HOME}

ENV PATH ${PATH}:${SCRIPT_DIR}

COPY --chown=user:user requirements.txt .

RUN pip3 install -r requirements.txt

COPY --chown=user:user scripts/*.py ${SCRIPT_DIR}
COPY --chown=user:user scripts/*.sh ${SCRIPT_DIR}
COPY --chown=user:user scripts/mui_language_picker_fonts.txt ${SCRIPT_DIR}
