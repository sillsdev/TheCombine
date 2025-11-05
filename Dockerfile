############################################################
# IMPORTANT
#
# Supported Platforms:
#   - Intel/AMD 64-bit
#   - ARM 64-bit
############################################################

# User guide build environment
FROM python:3.12.12-slim-bookworm@sha256:235ad56fa1e1407d8883bfcfc3b00fb6f24b43f46153a8163be60d6bb6099e39 AS user_guide_builder

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
FROM node:22.21.1-bookworm-slim@sha256:4de72fb3998934a953f1bee37f0e0254b27c535200b7fe31040bdd8569f9d6da AS frontend_builder
WORKDIR /app

# Install app dependencies.
COPY package*.json ./
RUN npm ci

# Build application.
COPY . ./
RUN npm run build

# Production environment.
FROM nginx:1.29.3@sha256:bd1578eec775d0b28fd7f664b182b7e1fb75f1dd09f92d865dababe8525dfe8b

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
