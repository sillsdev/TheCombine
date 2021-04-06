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
#  - a number (integer or decimal)
#  - already quoted
#  - a boolean (case insensitive)
# It returns 0 otherwise
###############################################

quote_value() {
  if [[ $1 =~ ^[+-]?[0-9]+([.][0-9]+)?$ ]] ; then
    # is it a number?
    return 1
  elif [[ $1 =~ ^".*"$ ]] ; then
    # is it already quoted?
    return 1
  else
    # is it a boolean?
    shopt -s nocasematch
    if [[ $1 =~ ^(true|false)?$ ]] ; then
      shopt -u nocasematch
      return 1
    fi
    shopt -u nocasematch
  fi
  return 0
}

OUTFILE=${FRONTEND_HOST_DIR}/scripts/config.js

# env_map defines a mapping between environement
# variable names and field names in the configuration
# JavaScript object that is generated.
declare -A env_map
env_map=(
  ["CONFIG_BASE_URL"]="baseUrl"
  ["CONFIG_USE_CONNECTION_URL"]="useConnectionBaseUrlForApi"
  ["CONFIG_CAPTCHA_REQD"]="captchaRequired"
  ["CONFIG_CAPTCHA_SITE_KEY"]="captchaSiteKey"
)
echo "window['runtimeConfig'] = {" > $OUTFILE

# iterate of the keys in the environment variable map
for env_var in "${!env_map[@]}"; do
  if [ -n  "${!env_var}" ]; then
    jsField=${env_map[${env_var}]}
    jsValue=${!env_var}
    # check to see if $jsValue needs to be quoted
    if quote_value ${jsValue} ; then
      printf '   %s: "%s",\n' ${jsField} ${jsValue} >> $OUTFILE
    else
      printf '   %s: %s,\n' ${jsField} ${jsValue} >> $OUTFILE
    fi
  fi
done
echo "}" >> $OUTFILE
