############################################################
# IMPORTANT
#
# Supported Platforms:
#   - Intel/AMD 64-bit
#   - ARM 64-bit
############################################################

# User guide build environment
FROM python:3.12.16-slim-bookworm@sha256:935c3c5b12357a7e10caa9c1e6ca5692344d97cf229832ef584be2cec9fc03df AS user_guide_builder

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
FROM node:24.22.3-bookworm-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54 AS frontend_builder
WORKDIR /app

# Install app dependencies.
COPY package*.json ./
RUN npm ci --ignore-scripts

# Build application.
COPY . ./
RUN npm run build

# Production environment.
FROM nginx:1.31.0@sha256:800e7c98538c6bf725f5177e841aa720ae0ed1c378bbea368b6330bfe18a36b3

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
