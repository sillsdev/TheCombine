############################################################
# IMPORTANT
#
# Supported Platforms:
#   - Intel/AMD 64-bit
#   - ARM 64-bit
############################################################

# Docker multi-stage build
FROM mcr.microsoft.com/dotnet/sdk:8.0.428-noble@sha256:3d5cad4bb76fd0130aefd6c629f7267c4aad40cccc86f7fbd1c81e277b58493b AS builder
WORKDIR /app

# Copy csproj and restore (fetch dependencies) as distinct layers.
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build.
COPY . ./
RUN dotnet publish -c Release -o build

# Build runtime image.
FROM mcr.microsoft.com/dotnet/aspnet:8.0.34-noble@sha256:fb50a3d0efad014b4fa8ee85fa498818172e38216cc73742821319f9db827bb2

ENV ASPNETCORE_URLS=http://+:5000
ENV COMBINE_IS_IN_CONTAINER=1
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_PRINT_TELEMETRY_MESSAGE=false

# Set the home directory to the app user's home.
ENV HOME=/home/app
ENV APP_HOME=${HOME}/backend
ENV APP_FILES=${HOME}/.CombineFiles

# Create the home directory for the new app user.
RUN mkdir -p $HOME

# Setup app user and group to known UID/GID; no login.
# This precedes the package install, whose dependencies (e.g., systemd) create
# system groups with dynamically allocated GIDs that can otherwise claim 999.
RUN groupmod --gid 999 app
RUN usermod  --uid 999 --gid app \
  --shell /sbin/nologin \
  --comment "Docker image user" \
  app

# Install system dependencies.
RUN apt-get update \
  && apt-get install -y ffmpeg \
  && rm -rf /var/lib/apt/lists/*

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
