# Docker multi-stage build.
FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS builder
WORKDIR /app

# Copy csproj and restore (fetch dependencies) as distinct layers.
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build.
COPY . ./
RUN dotnet publish -c Release -o out

# Build runtime image.
FROM mcr.microsoft.com/dotnet/core/aspnet:3.1
WORKDIR /app
COPY --from=builder /app/out .
ENTRYPOINT ["dotnet", "BackendFramework.dll"]
