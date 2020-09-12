#!/bin/sh

if [ -n "$COMBINE_ADMIN_USERNAME" ]; then
    dotnet BackendFramework.dll create-admin-username=$COMBINE_ADMIN_USERNAME
else
    dotnet BackendFramework.dll
fi
