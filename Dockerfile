############################################################
# IMPORTANT
#
# Supported Platforms:
#   - Intel/AMD 64-bit
#   - ARM 64-bit
############################################################

# User guide build environment
FROM python:3.12.10-slim-bookworm@sha256:97983fa8cc88343512862c62307159a82261c3528dc025f79e5a3f7af43e50b4 AS user_guide_builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN pip install --upgrade pip && \
    pip install tox

COPY dev-requirements.txt tox.ini ./
COPY docs/user_guide docs/user_guide

RUN tox -e user-guide

# Frontend build environment.
FROM node:22.17.0-bookworm-slim@sha256:358a55f9683d8444a810bf36ff1ea4f60522f55a82cada25f7eabdf79e445226 AS frontend_builder
WORKDIR /app

# Install app dependencies.
COPY package*.json ./
RUN npm ci

# Build application.
COPY . ./
RUN npm run build

# Production environment.
FROM nginx:1.28.0@sha256:06246bcae987ceb27a9b7274dff88cb3ba44f92cfc0a2f80a15f6c4bf6d5b5a1

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
