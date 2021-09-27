# NUC Certificates in Kubernetes

This document describes the design for managing the _Let's Encrypt_ certificates for the NUCs that are maintained in an
Amazon Web Services (AWS) S3 bucket.

The goal of the design is to have the DNS records point to the production cluster for all of the DNS names for each NUC
that is deployed. The production cluster is responsible to generate and renew the certificates for the NUCs and to push
any updated certificates to the AWS S3 bucket.

The NUC will have a single deployment to monitor the state of its _Let's Encrypt_ secret. When the certificate is due to
expire within `$CERT_RENEWAL` days (default is 60 days) _and_ the NUC is connected to the internet, then the deployment
will fetch its updated certificate from the AWS S3 bucket.

## Container Images

There are two specialized container images that are used to manage the _Let's Encrypt_ certificates for the NUCs.

### `combine_cert_proxy`

The `combine_cert_proxy` operates in one of two modes:

- _server_ mode monitors the NUC certificates on the current cluster for changes. When the certificate is updated, the
  new certificate is pushed to the AWS S3 bucket.
- _client_ mode updates the certificate for the current cluster from the AWS S3 storage when the certificate has changed
  and the cluster is connected to the internet.

_Server_ mode is invoked by calling the image's `monitor.py` entrypoint. The entry point does not exit under normal
circumstances.

_Client_ mode is invoked by calling the `check_cert.py` entrypoint to check for an updated NUC certificate. The
entrypoint exits once it has completed the check and update for the NUC's certificate.

`combine_cert_proxy` is based on the `sillsdev/aws-kubectl` image and installs the following software:

- `python3`, `pip3`
- kubernetes-client module for Python3
- entrypoint scripts

`combine_cert_proxy` uses the following environment variables:

- `NUC_CERTIFICATES` - a space-separated list of names of Kubernetes secrets that contain the NUC SSL certificates. Only
  one certificate is valid for _client_ mode;
- `AWS_ACCOUNT` - the 12-digit AWS Account Number for accessing the AWS S3 bucket;
- `AWS_DEFAULT_REGION` - the default region for the AWS S3 bucket;
- `AWS_ACCESS_KEY_ID` - the access key to read/write to AWS S3 bucket (similar to a userid);
- `AWS_SECRET_ACCESS_KEY` - the password for the `AWS_ACCESS_KEY_ID`; and
- `AWS_S3_BUCKET` - the URI for the AWS S3 bucket where the certificates are stored, for example,
  `s3://mybucket.com/certs`.

### `combine_cert_server`

The `combine_cert_server` serves two purposes:

1. it provides a webserver to satisfy the HTTP01 challenges from `cert-manager.io`; and
2. it serves a web page for each of the NUC URLs to instruct the user that they need to connect to the NUCs WiFi Access
   Point to use _The Combine_ running on the NUC.

`combine_cert_server` is based on the `nginx:1.21` image. It adds the static pages described above.

## Resources on the Production Cluster

The production cluster has the following Kubernetes resources:

| Resource Kind | Resource Name                                             | Description                                                                                                                                                                          |
| ------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Deployment    | `cert-monitor`                                            | based on the `combine_cert_proxy` image and calls the `monitor.py` entrypoint                                                                                                        |
| Service       | `nuc-web-server`                                          | based on `combine_cert_server`                                                                                                                                                       |
| ConfigMap     | `cert-config`                                             | defines the `NUC_CERTIFICATES` and `AWS_S3_BUCKET` environment variables                                                                                                             |
| Secret        | `aws-s3-cert-access`                                      | defines the `AWS_ACCOUNT`, `AWS_DEFAULT_REGION`, `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables.                                                              |
| Secret        | `nuc1-thecombine-app-tls`, `nuc2-thecombine-app-tls`, ... | Secrets created by `cert-manager.io` that contain the certificates returned by _Let's Encrypt_.                                                                                      |
| Issuer        | `letsencrypt-prod`, `letsencrypt-staging`                 | Certificate issuer used by `cert-manager.io` to know how to issue the certificates. `letsencrypt-prod` is for the production environment while `letsencrypt-staging` is for testing. |
| Ingress       | `ingress-nuc1`, `ingress-nuc2`, ...                       | The Ingress is used to route traffic to the `nuc-web-server` and specifies the TLS secret (SSL Certificate) to use to terminate the SSL.                                             |

## Resources on the NUC

The NUCs has the following Kubernetes resources:

| Resource Kind | Resource Name             | Description                                                                                                                              |
| ------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| CronJob       | `check-cert-cron`         | based on the `combine_cert_proxy` image and calls the `check_cert.py` entrypoint as scheduled in the crontab                             |
| ConfigMap     | `cert-config`             | defines the `NUC_CERTIFICATES` and `AWS_S3_BUCKET` environment                                                                           |
| Secret        | `aws-s3-cert-access`      | defines the `AWS_ACCOUNT`, `AWS_DEFAULT_REGION`, `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables.                  |
| Secret        | `nucX-thecombine-app-tls` | Secret to be downloaded/updated from the `$AWS_S3_BUCKET`. `nucX` is the name of the NUC where the cluster is running.                   |
| Ingress       | `ingress-nucX`            | The Ingress is used to route traffic to the `nuc-web-server` and specifies the TLS secret (SSL Certificate) to use to terminate the SSL. |

In addition, outside of Kubernetes, the NUC will be configured so that when an Ethernet cable is plugged-in and the
network is _routable_, a `Job` will be created that performs the same task as `check-cert-cron`.
