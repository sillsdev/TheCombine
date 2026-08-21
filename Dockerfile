############################################################
# IMPORTANT
#
# Supported Platforms:
#   - Intel/AMD 64-bit
#   - ARM 64-bit
############################################################

# User guide build environment
FROM python:3.12.13-slim-bookworm@sha256:8a7e7cc04fd3e2bd787f7f24e22d5d119aa590d429b50c95dfe12b3abe52f48b AS user_guide_builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN pip install pip==26.0.1 && \
    pip install tox==4.51.0

COPY dev-requirements.txt tox.ini ./
COPY docs/user_guide docs/user_guide

RUN tox -e user-guide

# Frontend build environment.
FROM node:22.23.1-bookworm-slim@sha256:813a7480f28fdadac1f7f5c824bcdad435b5bc1322a5968bbbdef8d058f9dff4 AS frontend_builder
WORKDIR /app

# Install app dependencies.
COPY package*.json ./
RUN npm ci --ignore-scripts

# Build application.
COPY . ./
RUN npm run build

# Production environment.
FROM nginx:1.31.2@sha256:ec4ed8b5299e5e90694af7750eb6dffd2627317d30544d056b0371f8082f7bce

WORKDIR /app

ENV HOST_DIR=/usr/share/nginx
ENV FRONTEND_HOST_DIR=${HOST_DIR}/html

RUN mkdir /etc/nginx/templates
RUN mkdir /etc/nginx/page_templates
RUN mkdir ${HOST_DIR}/fonts
RUN mkdir ${FRONTEND_HOST_DIR}/scripts
RUN mkdir ${FRONTEND_HOST_DIR}/url_moved

# Setup web content
COPY --from=user_guide_builder /app/docs/user_guide/site ${HOST_DIR}/user_guide
COPY --from=frontend_builder /app/dist ${FRONTEND_HOST_DIR}
COPY public/dictionaries ${HOST_DIR}/dictionaries
COPY public/locales ${FRONTEND_HOST_DIR}/locales
COPY nginx/pages/url_moved_home.html /etc/nginx/page_templates/url_moved_home.html
COPY public/favicon.ico ${FRONTEND_HOST_DIR}/url_moved/favicon.ico
COPY src/resources/tractor.png ${FRONTEND_HOST_DIR}/url_moved/tractor.png
COPY public/scripts/release.js ${FRONTEND_HOST_DIR}/scripts/release.js

# Setup nginx configuration templates
COPY nginx/templates/* /etc/nginx/templates/

# Copy additional configuration scripts
COPY nginx/init/* /docker-entrypoint.d/
