############################################################
# IMPORTANT
#
# Supported Platforms:
#   - Intel/AMD 64-bit
#   - ARM 64-bit
############################################################
FROM mongo:7.0.37-jammy@sha256:3dfcd54118850ef1dc583ce991fecca8bba8a9eeccb1ea62a662e2a9c24f5b81

WORKDIR /

RUN mkdir -p /data/semantic-domains /opt/thecombine

# Copy semantic domain import files
COPY semantic_domains/* /data/semantic-domains/

# from https://hub.docker.com/_/mongo
# Scripts in /docker-entrypoint-initdb.d run only on first startup of an empty
# data directory. We intentionally keep setup scripts out of initdb.d and run
# them from Kubernetes postStart to avoid first-boot race conditions.
COPY init/update-semantic-domains.sh /opt/thecombine/update-semantic-domains.sh

# Replica set readiness/alignment runs from Kubernetes postStart hook on every
# container start, so this script is intentionally kept out of initdb.d.
COPY init/00-replica-set.js /opt/thecombine/00-replica-set.js
