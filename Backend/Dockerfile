# Docker multi-stage build using 6.0.408-focal-amd64
FROM mcr.microsoft.com/dotnet/sdk@sha256:19c92d0a00d1b66d897bceaa7319bee0dd38a10a851c60bcec9474aa3f01e50f AS builder
WORKDIR /app

# Copy csproj and restore (fetch dependencies) as distinct layers.
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build.
COPY . ./
RUN dotnet publish -c Release -o build

# Build runtime image.  Using 6.0.16-focal-amd64
FROM mcr.microsoft.com/dotnet/aspnet@sha256:7bf9ac0ea764f4bd3669b43bcde2bda92fc950af36eebeb466a89e1186145466

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
  # icu.net dependency: libdl.so
  libc6-dev ffmpeg \
  && rm -rf /var/lib/apt/lists/*

# Create the home directory for the new app user.
RUN mkdir -p $HOME

# Create an app user so the program doesn't run as root.
RUN groupadd -r app && \
  useradd -r -g app -d $HOME -s /sbin/nologin -c "Docker image user" app

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
