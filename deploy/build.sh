#!/bin/bash

##########################
#
# build.sh
#
# build.sh will build the frontend and backend for the
# Rapid Language Collection tool.
#
# Requirements
#  - .NET SDK 2.1
#  - node >= 10.16.0
#  - npm >= 6.9.0
#
# Usage:
#    build.sh
#

set -euf -o pipefail

cd ..
echo "Building frontend"
npm install
npm run build
cd Backend
echo "Removing previous build results"
rm -rf bin/Release/*
echo "Building backend"
dotnet publish -c Release
cd ../deploy
