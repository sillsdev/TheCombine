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

WORKDIR /app

# Args used to configure frontend build.
ARG COMBINE_CAPTCHA_REQUIRED
ARG COMBINE_CAPTCHA_SITE

ENV NGINX_HOST_DIR /usr/share/nginx/html

COPY --from=builder /app/build ${NGINX_HOST_DIR}

# Configure frontend.
COPY nginx/generate_config.sh ./
RUN ./generate_config.sh > ${NGINX_HOST_DIR}/config.js \
    && rm generate_config.sh

# Copy default self-signed certificate.
# Overwrite this with real certificate for authentication in production.
COPY nginx/certs /ssl

#COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
