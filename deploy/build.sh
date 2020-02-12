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
echo "Building app"
npm install
npm run build
cd Backend
dotnet publish -c Release
cd ../deploy
