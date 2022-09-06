FROM mongo:5.0

WORKDIR /app

RUN mkdir /data/semantic-domains

# Copy semantic domain import files
COPY semantic_domains/* /data/semantic-domains/
# Copy database initialization scripts to /docker-entrypoint-initdb.d
COPY docker-entrypoint-initdb.d/* /docker-entrypoint-initdb.d/
