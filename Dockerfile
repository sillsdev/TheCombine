# User guide build environment.
FROM python:3.8 AS user_guide_builder

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
FROM node:14 AS frontend_builder
WORKDIR /app

# Install app dependencies.
COPY package*.json ./
RUN npm install

# Build application.
COPY . ./
RUN npm run build

# Production environment.
FROM nginx:1.19

WORKDIR /app

ENV USER_GUIDE_HOST_DIR /usr/share/nginx/user_guide
ENV FRONTEND_HOST_DIR /usr/share/nginx/html

RUN mkdir /etc/nginx/templates
RUN mkdir /etc/nginx/page_templates
RUN mkdir ${FRONTEND_HOST_DIR}/nuc
RUN mkdir ${FRONTEND_HOST_DIR}/url_moved

# Setup web content
COPY --from=user_guide_builder /app/docs/user_guide/site ${USER_GUIDE_HOST_DIR}
COPY --from=frontend_builder /app/build ${FRONTEND_HOST_DIR}
COPY nginx/pages/nuc_home.html ${FRONTEND_HOST_DIR}/nuc/index.html
COPY nginx/pages/url_moved_home.html /etc/nginx/page_templates/url_moved_home.html
COPY public/favicon.ico ${FRONTEND_HOST_DIR}/nuc/favicon.ico
COPY public/favicon.ico ${FRONTEND_HOST_DIR}/url_moved/favicon.ico
COPY src/resources/tractor.png ${FRONTEND_HOST_DIR}/nuc/tractor.png
COPY src/resources/tractor.png ${FRONTEND_HOST_DIR}/url_moved/tractor.png

# Setup nginx configuration templates
COPY nginx/templates/* /etc/nginx/templates/

# Copy additional configuration scripts
COPY nginx/*.sh /docker-entrypoint.d
