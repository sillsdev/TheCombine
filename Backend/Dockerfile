# Docker multi-stage build.
FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS builder
WORKDIR /app

# Copy csproj and restore (fetch dependencies) as distinct layers.
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build.
COPY . ./
RUN dotnet publish -c Release -o build

# Build runtime image.
FROM mcr.microsoft.com/dotnet/core/aspnet:3.1

ENV ASPNETCORE_IS_IN_CONTAINER=1

WORKDIR /app
COPY createAdminUser.sh ./
COPY --from=builder /app/build ./
ENTRYPOINT ["dotnet", "BackendFramework.dll"]
