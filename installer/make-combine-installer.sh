#! /usr/bin/env bash

if [[ $# -gt 0 ]] ; then
  COMBINE_VERSION=$1
fi
if [ -z "${COMBINE_VERSION}" ] ; then
  echo "COMBINE_VERSION is not set."
  exit 1
fi
makeself --tar-quietly ../deploy ./combine-installer.run "Combine Installer" scripts/install-combine.sh ${COMBINE_VERSION}
