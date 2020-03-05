#!/bin/bash


set -euf -o pipefail

# get PID for the certificate update process
SVC_PID=`systemctl status sync_cert | grep "Main PID" | sed -E 's/^ *Main PID: ([0-9][0-9]*) *.*/\1/'`

kill -SIGUSR1 ${SVC_PID}
