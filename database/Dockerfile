############################################################
# IMPORTANT
#
# Supported Platforms:
#   - Intel/AMD 64-bit
#   - ARM 64-bit
############################################################
FROM mongo:8.0.38-noble@sha256:76a93cc399d05709baeea4e55385749657aa0085ad5b497c851380778eccea2c

WORKDIR /

RUN mkdir -p /data/semantic-domains /opt/thecombine

# Copy semantic domain import files
COPY semantic_domains/* /data/semantic-domains/

# from https://hub.docker.com/_/mongo
# Scripts in /docker-entrypoint-initdb.d run only on first startup of an empty
# data directory. We intentionally keep setup scripts out of initdb.d and run
# them from Kubernetes postStart to avoid first-boot race conditions.
COPY init/update-semantic-domains.sh /opt/thecombine/update-semantic-domains.sh

# Replica set readiness/alignment, index creation, and featureCompatibilityVersion
# alignment run from Kubernetes postStart hook on every container start, so these
# scripts are intentionally kept out of initdb.d.
COPY init/00-replica-set.js /opt/thecombine/00-replica-set.js
COPY init/01-indexes.js /opt/thecombine/01-indexes.js
COPY init/02-feature-compatibility.js /opt/thecombine/02-feature-compatibility.js
