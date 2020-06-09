FROM node:12

WORKDIR /app

# Install app dependencies.
COPY package*.json ./
RUN npm install

# Build application.
COPY . ./
RUN npm run build
