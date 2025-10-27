# Dockerfile to build a Kubernetes Worker container for the Combine.  The
# image shall contain a collection of scripts to perform the following functions:
#  - backup The Combine database and backend data files
#  - restore The Combine database and backend data files from a previous backup
#  - monitor specified secrets for changes and push the updated secrets to AWS
#    S3 storage
#  - check the current TLS secret for updates in AWS S3 storage and update the
#    secret accordingly.
# The scripts are written in Python.

############################################################
# IMPORTANT
#
# Supported Platforms:
#   - Intel/AMD 64-bit
#   - ARM 64-bit
############################################################

# Multi-arch base image pinned to version 0.4.0
# amd64 digest: sha256:75c13b324e3e139d17294749b6aabf1e52116c98ca6ba03f7401dbabaa2007da
# arm64 digest: sha256:6f318bee146c0444272a0920903f886e26513bb9d4f1e11327ad9cb368b7f1ae
FROM public.ecr.aws/thecombine/aws-kubectl:0.4.0-$TARGETARCH

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

ENV PATH=${PATH}:${SCRIPT_DIR}

COPY --chown=user:user requirements.txt .

RUN pip3 install -r requirements.txt

COPY --chown=user:user scripts/*.py ${SCRIPT_DIR}
COPY --chown=user:user scripts/*.sh ${SCRIPT_DIR}
COPY --chown=user:user scripts/mui_language_picker_fonts.txt ${SCRIPT_DIR}
