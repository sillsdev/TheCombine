#!/bin/bash

###############################################
# This script creates a placeholder config.js
# file for The Combine frontend during the
# Docker build process.
#
# This ensures config.js exists before the build
# for compatibility with Parcel. The actual
# configuration values will be populated at
# runtime by the nginx init script.
#
# Writes to: ./public/scripts/config.js
###############################################

OUTFILE=./public/scripts/config.js

# Ensure the output directory exists
mkdir -p "$(dirname "${OUTFILE}")"

# Create an empty runtime config object
# This will be overwritten at runtime with actual values
echo "window['runtimeConfig'] = {};" > $OUTFILE
