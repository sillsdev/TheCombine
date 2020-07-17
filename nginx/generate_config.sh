#!/bin/sh

# This script generates a config.js that is used by the frontend at runtime.

# TODO: Infer a common base URL (relative URL) in production as both the
#   frontend and backend are hosted behind the same NGINX proxy.
cat  << EOF
window['runtimeConfig'] = {
    useConnectionBaseUrlForApi: true,
    captchaRequired: $COMBINE_CAPTCHA_REQUIRED,
    captchaSiteKey: "$COMBINE_CAPTCHA_SITE"
}
EOF
