# User guide build environment using Python 3.11.3.
FROM python@sha256:c0f1e6bbed1bcb86c3579d998e3fa9db4f49711558acc5047fd2b21f096299b2 AS user_guide_builder

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PIP_NO_CACHE_DIR 1

WORKDIR /app

RUN pip install --upgrade pip && \
    pip install tox

COPY dev-requirements.txt tox.ini ./
COPY docs/user_guide docs/user_guide

RUN tox -e user-guide

# Frontend build environment.
FROM node:18.16-bullseye-slim AS frontend_builder
WORKDIR /app

# Install app dependencies.
COPY package*.json ./
RUN npm ci

# Build application.
COPY . ./
RUN npm run build

# Production environment.
FROM nginx:1.23

WORKDIR /app

ENV USER_GUIDE_HOST_DIR /usr/share/nginx/user_guide
ENV FRONTEND_HOST_DIR /usr/share/nginx/html

RUN mkdir /etc/nginx/templates
RUN mkdir /etc/nginx/page_templates
RUN mkdir ${FRONTEND_HOST_DIR}/scripts
RUN mkdir ${FRONTEND_HOST_DIR}/url_moved

# Setup web content
COPY --from=user_guide_builder /app/docs/user_guide/site ${USER_GUIDE_HOST_DIR}
COPY --from=frontend_builder /app/build ${FRONTEND_HOST_DIR}
COPY nginx/pages/url_moved_home.html /etc/nginx/page_templates/url_moved_home.html
COPY public/favicon.ico ${FRONTEND_HOST_DIR}/url_moved/favicon.ico
COPY src/resources/tractor.png ${FRONTEND_HOST_DIR}/url_moved/tractor.png
COPY public/scripts/release.js ${FRONTEND_HOST_DIR}/scripts/release.js

# Setup nginx configuration templates
COPY nginx/templates/* /etc/nginx/templates/

# Copy additional configuration scripts
COPY nginx/init/* /docker-entrypoint.d/
