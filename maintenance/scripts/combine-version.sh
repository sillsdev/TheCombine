#! /usr/bin/env bash

if [ "$#" == "0" ] ; then
    # Print versions
    for deployment in frontend backend database maintenance ; do
        VERSION=`kubectl describe deployment $deployment | grep "Image.*combine_" | sed -Ee "s/^ +Image: .*://"`
        echo "$deployment: $VERSION"
    done
else
    echo "Set version to $1"
    # Check to see if we are using public repos or private ones
    VERSION_PATTERN='^v[0-9]+\.[0-9]+\.[0-9]+*$'
    if [[ $1 =~ $VERSION_PATTERN ]] ; then
        REPO="public.ecr.aws/thecombine/"
    else
        REPO="$AWS_ACCOUNT.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com"
        if ! kubectl get secrets aws-login-credentials 2>&1 >/dev/null ; then
            echo "The requested version is in a private repo and this device does not have access to it."
            exit 1
        fi
    fi
    kubectl -n thecombine set image deployment/database database="$REPO/combine_database:$1"
    kubectl -n thecombine set image deployment/backend backend="$REPO/combine_backend:$1"
    kubectl -n thecombine set image deployment/frontend frontend="$REPO/combine_frontend:$1"
    kubectl -n thecombine set image deployment/maintenance maintenance="$REPO/combine_maint:$1"
fi
