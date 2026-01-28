############################################################
# IMPORTANT
#
# Supported Platforms:
#   - Intel/AMD 64-bit
#   - ARM 64-bit
############################################################

# User guide build environment
FROM python:3.12.12-slim-bookworm@sha256:28cf028e5a544e92dbe11450debd93dd5eb70eaf3179a9e878cfaee426556b3b AS user_guide_builder

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
FROM node:22.21.1-bookworm-slim@sha256:7378f5a4830ef48eb36d1abf4ef398391db562b5c41a0bded83192fbcea21cc8 AS frontend_builder
WORKDIR /app

# Install app dependencies.
COPY .npmrc ./
COPY package*.json ./
RUN npm ci --ignore-scripts

# Build application.
COPY . ./
RUN npm run build

# Production environment.
FROM nginx:1.29.4@sha256:ca871a86d45a3ec6864dc45f014b11fe626145569ef0e74deaffc95a3b15b430

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
