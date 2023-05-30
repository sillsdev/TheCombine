# Use mongo:6.0.6-jammy for linux/amd64
FROM mongo@sha256:028650e24cdc662da15e11809d63b4f2a0b7eb782f3ca4f80a303a4c255fab89

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
