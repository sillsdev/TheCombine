FROM certbot/certbot:v1.8.0

RUN apk update && \
    apk upgrade && \
    apk add --no-cache bash && \
    apk add --no-cache curl

COPY scripts/*.sh /usr/bin/

ENTRYPOINT ["entrypoint.sh"]
