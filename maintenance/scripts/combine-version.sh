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
    fi

    REPO=`kubectl describe deployment $deployment | grep "Image.*combine_" | sed -Ee "s/^ +Image: .*://"`
    kubectl -n thecombine set image deployment/database database="public.ecr.aws/thecombine/combine_database:$1"
    kubectl -n thecombine set image deployment/backend backend="public.ecr.aws/thecombine/combine_backend:$1"
    kubectl -n thecombine set image deployment/frontend frontend="public.ecr.aws/thecombine/combine_frontend:$1"
    kubectl -n thecombine set image deployment/maintenance maintenance="public.ecr.aws/thecombine/combine_maint:$1"
fi
