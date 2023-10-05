#! /usr/bin/env bash

TTY_DEV="${1:-/dev/ttyACM0}"

if [ -e "$TTY_DEV" ] ; then
    ETH_ADD_STR=`ip -4 -br address | grep "^en"`
    ETH_IP=`echo ${ETH_ADD_STR} | sed -E -e 's%^[0-9a-z]+\s+[A-Z]+\s+([0-9\.]+)/.*%\1%'`
    ETH_STATUS=`echo ${ETH_ADD_STR} | sed -E -e 's%^[0-9a-z]+\s+([A-Z]+)\s+[0-9\.]+/.*%\1%'`

    # Print results
    # Clear screen
    echo -en \\xfe\\x58 > ${TTY_DEV}
    # Move cursor to origin
    echo -en \\xfe\\x48 > ${TTY_DEV}
    if [[ $ETH_IP == "" && $ETH_STATUS == "" ]] ; then
        # set red background
        echo -en \\xfe\\xd0\\xff\\x1f\\x1f  > ${TTY_DEV}
        #     1234567890123456
        echo "  NO ETHERNET" > ${TTY_DEV}
        echo -n "   CONNECTED" > ${TTY_DEV}
    else
        # set green background
        echo -en \\xfe\\xd0\\x3f\\xff\\x7f > ${TTY_DEV}
        # Print IP address
        echo  "IP: ${ETH_IP} " > ${TTY_DEV}
        # Print I/F Status
        echo -n "Status: ${ETH_STATUS} " > ${TTY_DEV}
    fi
fi
