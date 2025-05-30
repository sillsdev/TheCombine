#! /bin/bash

###############################################
# This script creates the runtime configuration
# file for TheCombine frontend, config.js, from
# environment variables that are defined for the
# process.
#
# Assumes that the FRONTEND_HOST_DIR is defined
# as the path to the nginx html pages and that
# the configuration is to be written to:
#  ${FRONTEND_HOST_DIR}/scripts/config.js
###############################################

###############################################
# quote_value() checks to see if the value should
# be quoted in javascript.  It returns 1 if the
# first argument is:
#  - a base-10 integer or decimal number.  Does
#    not support floating point notation nor
#    underscores as numeric separators
#  - already quoted
#  - a boolean
# It returns 0 otherwise
###############################################

quote_value() {
  if [[ $1 =~ ^[+-]?[0-9]+([.][0-9]+)?$ ]] ; then
    # it is a number
    return 1
  elif [[ $1 =~ ^".*"$ ]] ; then
    # it is already quoted
    return 1
  else
    # it is a boolean
    if [[ $1 =~ ^(true|false)?$ ]] ; then
      return 1
    fi
  fi
  # must be a string
  return 0
}

OUTFILE=${FRONTEND_HOST_DIR}/scripts/config.js

# env_map defines a mapping between environment
# variable names and field names in the configuration
# JavaScript object that is generated.
declare -A env_map
env_map=(
  ["CONFIG_USE_CONNECTION_URL"]="useConnectionBaseUrlForApi"
  ["CONFIG_CAPTCHA_REQUIRED"]="captchaRequired"
  ["CONFIG_CAPTCHA_SITE_KEY"]="captchaSiteKey"
  ["CONFIG_OFFLINE"]="offline"
  ["CONFIG_EMAIL_ENABLED"]="emailServicesEnabled"
  ["CONFIG_SHOW_CERT_EXPIRATION"]="showCertExpiration"
)
echo "window['runtimeConfig'] = {" > $OUTFILE

# iterate of the keys in the environment variable map
for env_var in "${!env_map[@]}"; do
  if [ -n  "${!env_var}" ]; then
    jsField=${env_map[${env_var}]}
    jsValue=${!env_var}
    # check to see if $jsValue needs to be quoted
    if quote_value "${jsValue}" ; then
      printf '   %s: "%s",\n' ${jsField} "${jsValue}" >> $OUTFILE
    else
      printf '   %s: %s,\n' ${jsField} "${jsValue}" >> $OUTFILE
    fi
  fi
done
echo "};" >> $OUTFILE
