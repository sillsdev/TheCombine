############################################################
# IMPORTANT
#
# Supported Platforms:
#   - Intel/AMD 64-bit
#   - ARM 64-bit
############################################################

# Docker multi-stage build
FROM mcr.microsoft.com/dotnet/sdk:8.0.416-jammy@sha256:48a4798dec68044fff6592f4c6c5ceeff15b1bed428810814cf757a5b5f1068d AS builder
WORKDIR /app

# Copy csproj and restore (fetch dependencies) as distinct layers.
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build.
COPY . ./
RUN dotnet publish -c Release -o build

# Build runtime image.
FROM mcr.microsoft.com/dotnet/aspnet:8.0.22-jammy@sha256:b7cb9bbd93b79247880df1792cd8641ca2319e2e62daebea214ba2d2fa25704e

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
  && apt-get install -y ffmpeg \
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
