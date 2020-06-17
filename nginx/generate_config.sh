#!/bin/sh

# This script generates a config.js that is used by the frontend at runtime.

# TODO: Infer a common base URL (relative URL) in production as both the
#   frontend and backend are hosted behind the same NGINX proxy.
cat  << EOF
window['runtimeConfig'] = {
    baseUrl: "$API_BASE_URL",
    captchaRequired: $CAPTCHA_REQUIRED,
    captchaSiteKey: "$CAPTCHA_SITE"
}
EOF
