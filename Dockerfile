# User guide build environment.
FROM python:3.8 AS user_guide_builder

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PIP_NO_CACHE_DIR 1

WORKDIR /app

RUN pip install --upgrade pip && \
    pip install tox

COPY dev-requirements.txt tox.ini ./
COPY user_guide user_guide

RUN tox -e user-guide

# Frontend build environment.
FROM node:12 AS frontend_builder
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
RUN mkdir ${FRONTEND_HOST_DIR}/nuc

# Setup web content
COPY --from=user_guide_builder /app/user_guide/site ${USER_GUIDE_HOST_DIR}
COPY --from=frontend_builder /app/build ${FRONTEND_HOST_DIR}
COPY nginx/pages/nuc_home.html ${FRONTEND_HOST_DIR}/nuc/index.html

# Setup nginx configuration templates
COPY nginx/templates/* /etc/nginx/templates/

# Copy additional configuration scripts
COPY nginx/*.sh /docker-entrypoint.d
