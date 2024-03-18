#! /usr/bin/env bash

if [[ $# -gt 0 ]] ; then
  COMBINE_VERSION=$1
fi
if [ -z "${COMBINE_VERSION}" ] ; then
  read -p "Enter Combine version to install: " COMBINE_VERSION
fi
makeself --tar-quietly ../deploy ./combine-installer.run "Combine Installer" scripts/install-combine.sh ${COMBINE_VERSION}
