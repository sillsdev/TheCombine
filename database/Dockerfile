############################################################
# IMPORTANT
#
# Supported Platforms:
#   - Intel/AMD 64-bit
#   - ARM 64-bit
############################################################
FROM mongo:7.0.28-jammy@sha256:8ddd3db4d2638eb914cce56284e2f0d6daf140bba31679b2af86f7d790a4c77e

WORKDIR /

RUN mkdir /data/semantic-domains

# Copy semantic domain import files
COPY semantic_domains/* /data/semantic-domains/

# from https://hub.docker.com/_/mongo
# Initializing a fresh instance
# When a container is started for the first time it will execute files
# with extensions .sh and .js that are found in /docker-entrypoint-initdb.d.
# Files will be executed in alphabetical order. .js files will be executed
# by mongosh (mongo on versions below 6) using the database specified by
# the MONGO_INITDB_DATABASE variable, if it is present, or test otherwise.
# You may also switch databases within the .js script.
COPY init/* /docker-entrypoint-initdb.d/
