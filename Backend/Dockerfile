# Docker multi-stage build
FROM mcr.microsoft.com/dotnet/sdk:8.0.302-1-jammy-amd64@sha256:9e23010bf3e1e837e0421f2f0cae3778f9c8fb4afaef331cc26ac15969494020 AS builder
WORKDIR /app

# Copy csproj and restore (fetch dependencies) as distinct layers.
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build.
COPY . ./
RUN dotnet publish -c Release -o build

# Build runtime image.
FROM mcr.microsoft.com/dotnet/aspnet:8.0.6-jammy-amd64@sha256:508870ea8c866710365cef2ba45c25caa172463756e8d7a94733ba49501a6a23

ENV ASPNETCORE_URLS=http://+:5000
ENV COMBINE_IS_IN_CONTAINER=1
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_PRINT_TELEMETRY_MESSAGE=false

# Set the home directory to the app user's home.
ENV HOME=/home/app
ENV APP_HOME=${HOME}/backend
ENV APP_FILES=${HOME}/.CombineFiles

# Install system dependencies.
RUN apt-get update \
  && apt-get install -y \
  ffmpeg \
  && rm -rf /var/lib/apt/lists/*

# Create the home directory for the new app user.
RUN mkdir -p $HOME

# Setup app user and group to known UID/GID; no login.
RUN groupmod --gid 999 app
RUN usermod  --uid 999 --gid app \
      --shell /sbin/nologin \
      --comment "Docker image user" \
      app

## Set up application install directory.
RUN mkdir $APP_HOME && \
  mkdir $APP_FILES && \
  # Give access to the entire home folder so the backend can create files and folders there.
  chown -R app:app $HOME
WORKDIR $APP_HOME

# Copy in the build application.
COPY --chown=app:app launch.sh ./
COPY --chown=app:app --from=builder /app/build ./

# Change to the app user.
USER app

ENTRYPOINT ["./launch.sh"]
