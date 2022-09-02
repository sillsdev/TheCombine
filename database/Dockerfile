FROM mongo:5.0

WORKDIR /app

RUN mkdir /data/semantic-domains

# Copy semantic domain import files
COPY semantic_domains/* /data/semantic-domains/
# Copy scripts to /usr/local/bin
COPY scripts/* /usr/local/bin/
