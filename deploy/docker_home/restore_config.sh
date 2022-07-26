# restore /etc/hosts entries for combine targets
if [ -f "/config/hosts" ] ; then
    cp /config/hosts /etc
fi

if [ -d "/config/.ssh" ] ; then
    cp -r /config/.ssh ${HOME}
fi

if [ -d "/config/.kube" ] ; then
    cp -r /config/.kube ${HOME}
fi

if [ -f "/config/.env" ] ; then
    cp /config/.env ${HOME}
    . ${HOME}/.env
fi
