#! /usr/bin/env bash

# cd to the directory where the script is installed
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# Definitions for writing to an Adafruit 16x2 character display
# https://www.adafruit.com/product/782#technical-details

TTY_DEV="${1:-/dev/ttyACM0}"
CLEAR_SCREEN="\\xfe\\x58"
TO_ORIGIN="\\xfe\\x48"
SET_BACKGROUND="\\xfe\\xd0"
RED="\\xff\\x1f\\x1f"
GREEN="\\x3f\\xff\\x7f"

HOSTNAME=`hostname`
ENDDATE_STR=`kubectl -n thecombine get secret/${HOSTNAME}-thecombine-app-tls -o "jsonpath={.data['tls\.crt']}"\
            | base64 -d | openssl x509 -enddate -noout | sed "s/^notAfter=//"`
read -ra ENDDATE <<< $ENDDATE_STR

echo -e "End date: ${ENDDATE[@]}\n"
DATE="${ENDDATE[0]} ${ENDDATE[1]}, ${ENDDATE[3]}"
TIME="${ENDDATE[2]} ${ENDDATE[4]}"
if [ -e "$TTY_DEV" ] ; then
    echo -en  "${CLEAR_SCREEN}"> ${TTY_DEV}
    # Move cursor to origin
    echo -en  "${TO_ORIGIN}" > ${TTY_DEV}
    # set green background
    echo -en "${SET_BACKGROUND}${GREEN}" > ${TTY_DEV}
    # Print date
    echo  "  ${DATE} " > ${TTY_DEV}
    # Print time
    echo -n "  ${TIME} " > ${TTY_DEV}
else
    echo "${DATE}"
    echo "${TIME}"
fi
