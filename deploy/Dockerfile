############################################################
# IMPORTANT
#
# Supported Platforms:
#   - Intel/AMD 64-bit
#   - ARM 64-bit
############################################################

FROM python:3.12.8-slim-bookworm

USER root

RUN apt-get update && \
  apt-get install -y python3-pip nano curl openssh-client iputils-ping && \
  apt-get autoremove && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Install kubectl and helm
RUN MACH=$(case $(uname -m) in *86*) echo amd64;; *aarch*) echo arm64;; *arm*) echo arm64;; esac) && \
  curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/${MACH}/kubectl" && \
  install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl && \
  curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 && \
  chmod 700 get_helm.sh && \
  ./get_helm.sh && \
  rm kubectl get_helm.sh

ENV HOME=/root
ENV PATH=${PATH}:${HOME}/scripts

COPY requirements.txt ${HOME}
RUN pip3 install -r ${HOME}/requirements.txt

# Create directory for SSH Keys
RUN mkdir ${HOME}/.ssh

# Copy configuration management scripts
COPY docker_home/* ${HOME}/

# Copy Python scripts for setting up and deploying the target
# to ~/scripts
COPY scripts/ ${HOME}/scripts

# Copy helm templates to ~/helm
COPY helm/ ${HOME}/helm

# Copy Ansible configuration files to ~/ansible
COPY ansible/ ${HOME}/ansible

ENTRYPOINT [ "/bin/bash" ]
