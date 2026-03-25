############################################################
# IMPORTANT
#
# Supported Platforms:
#   - Intel/AMD 64-bit
#   - ARM 64-bit
############################################################
FROM mongo:7.0.30-jammy@sha256:aee9bae9f1a5507a51e19f24b015162cbcd7004695d99175dbccc427e20760e2

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
