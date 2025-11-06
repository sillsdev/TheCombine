############################################################
# IMPORTANT
#
# Supported Platforms:
#   - Intel/AMD 64-bit
#   - ARM 64-bit
############################################################
FROM mongo:7.0.25-jammy@sha256:5f8b6108f61e066b910c1e85ebd43fdfcbde94b78031601e7f09f5faf3f5d555

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
