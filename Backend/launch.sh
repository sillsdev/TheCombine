#!/bin/sh

if [ -n "$ASPNETCORE_ADMIN_USERNAME" ]; then
    dotnet BackendFramework.dll create-admin-username=$ASPNETCORE_ADMIN_USERNAME
else
    dotnet BackendFramework.dll
fi
