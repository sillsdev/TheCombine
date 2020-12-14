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
FROM nginx:1.19

RUN mkdir /etc/nginx/templates

WORKDIR /app

ENV NGINX_HOST_DIR /usr/share/nginx/html

RUN mkdir ${NGINX_HOST_DIR}/nuc

# Setup web content
COPY --from=builder /app/build ${NGINX_HOST_DIR}
COPY nginx/pages/nuc_home.html ${NGINX_HOST_DIR}/nuc/index.html

# Setup nginx configuration templates
COPY nginx/templates/* /etc/nginx/templates/

# Copy additional configuration scripts
COPY nginx/*.sh /docker-entrypoint.d
