# Build environment.
FROM node:12 AS builder
WORKDIR /app

# Install app dependencies.
COPY package*.json ./
RUN npm install

# Build application.
COPY . ./
RUN npm run build

# Production environment.
FROM staticfloat/nginx-certbot

LABEL com.github.sillsdev.thecombine.version="0.1.0-alpha.0"

WORKDIR /app

ENV NGINX_HOST_DIR /usr/share/nginx/html

COPY --from=builder /app/build ${NGINX_HOST_DIR}

# Copy default self-signed certificate.
# Overwrite this with real certificate for authentication in production.
COPY nginx/certs /ssl

COPY nginx/conf.d/thecombine.conf /etc/nginx/user.conf.d/thecombine.conf
