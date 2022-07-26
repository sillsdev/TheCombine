# ~/.bash_logout: executed by bash login shells on exit.

if [ -d "/config" ] ; then
    cp /etc/hosts /config
    if [ -d "${HOME}/.ssh" ] ; then
        cp -r ${HOME}/.ssh /config
    fi
    if [ -d "${HOME}/.kube" ] ; then
        cp -r ${HOME}/.kube /config
    fi
    if [ -f "${HOME}/.env" ] ; then
        cp ${HOME}/.env /config
    fi
fi
