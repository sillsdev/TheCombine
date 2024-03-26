#! /usr/bin/env bash

TTY_DEV="${1:-/dev/ttyACM0}"
CLEAR_SCREEN="\\xfe\\x58"
TO_ORIGIN="\\xfe\\x48"
SET_BACKGROUND="\\xfe\\xd0"
RED="\\xff\\x1f\\x1f"
GREEN="\\x3f\\xff\\x7f"

if [ -e "$TTY_DEV" ] ; then
    echo -en  "${CLEAR_SCREEN}"> ${TTY_DEV}
    # Move cursor to origin
    echo -en  "${TO_ORIGIN}" > ${TTY_DEV}
    ETH_ADD_STR=`ip -4 -br address | grep "^en"`
    if [ -n "${ETH_ADD_STR}" ] ; then
        ETH_IP=`echo ${ETH_ADD_STR} | sed -E -e 's%^[0-9a-z]+\s+[A-Z]+\s+([0-9\.]+)/.*%\1%'`
        ETH_STATUS=`echo ${ETH_ADD_STR} | sed -E -e 's%^[0-9a-z]+\s+([A-Z]+)\s+[0-9\.]+/.*%\1%'`
        # set green background
        echo -en "${SET_BACKGROUND}${GREEN}" > ${TTY_DEV}
        # Print IP address
        echo  "IP: ${ETH_IP} " > ${TTY_DEV}
        # Print I/F Status
        echo -n "Status: ${ETH_STATUS} " > ${TTY_DEV}
    else
        # set red background
        echo -en "${SET_BACKGROUND}${RED}"  > ${TTY_DEV}
        echo "  NO ETHERNET" > ${TTY_DEV}
        echo -n "   CONNECTED" > ${TTY_DEV}
    fi
fi
