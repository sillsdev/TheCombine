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
FROM nginx:1.18

RUN mkdir /etc/nginx/templates

WORKDIR /app

ENV NGINX_HOST_DIR /usr/share/nginx/html

COPY --from=builder /app/build ${NGINX_HOST_DIR}

COPY nginx/templates/* /etc/nginx/templates/
