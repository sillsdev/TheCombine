FROM mongo:7.0.12-jammy@sha256:afa36bca12295b5f9dae68a493c706113922bdab520e901bd5d6c9d7247a1d8d

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
