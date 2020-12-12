# Design notes for the certmgr container for TheCombine

## Certificate storage

The certificates are stored in a docker volume. The volume is named letsencrypt
and is mounted by the `frontend` and the `certmgr` containers. Both containers mount
the volume at `/etc/cert_store`.

At the top level, there are 2 directories in `/etc/cert_store`:

- `nginx` - The Nginx web server is configured to read its SSL certificates from:

  - SSL Certificate: `/etc/cert_store/nginx/<server_name>/fullchain.pem`
  - SSL Private Key: `/etc/cert_store/nginx/<server_name>/privkey.pem`

  This is implemented by setting up `/etc/cert_store/nginx/<server_name>` as a
  symbolic link to the self-signed or letsencrypt certificates.

- `selfsigned` - stores a self-signed certificate for the server in
  `/etc/letsencrypt/selfsigned/<server_name>`

Certificates issued by letsencrypt are stored in `/etc/letsencrypt/live/<server_name>`.

## Entrypoint scripts for the certmgr container for TheCombine

### Environment Variables

The following environment variables are used by the certmgr to control its
behavior:

| Variable Name      | Description                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CERT_MODE          | May be one of `self-signed`, `letsencrypt`, or `cert-server` to specify which of the certificate management personalities to use.                                                                                                                                                                                                                                                                        |
| CERT_EMAIL         | Set to e-mail address for certificate expiration notices first                                                                                                                                                                                                                                                                                                                                           |
| CERT_STAGING       | If `CERT_STAGING` is set to a value other than `"0"` then letsencrypt will generate a test certificate instead of a production certificate. Web browsers will not accept it as a valid certificate but test certificates do not count towards the rate limits for certificates generated for a domain.                                                                                                   |
| CERT_ADDL_DOMAINS  | A space-separated list of additional domains for the certificate. Note that these are additional domain names that may be used for the server, e.g. www.thecombine.app, www1.thecombine.app. They are not the domain names for other devices for which the server requests a certificate (see CERT_PROXY_DOMAINS below.)                                                                                 |
| SERVER_NAME        | Name of the server. Also used to specify the directory where the certificates are stored.                                                                                                                                                                                                                                                                                                                |
| MAX_CONNECT_TRIES  | Number of times to check if the webserver is up before attempting to get a certificate from letsencrypt.                                                                                                                                                                                                                                                                                                 |
| CERT_STORE         | Location where certificates are stored. (Default: `/etc/cert_store`)                                                                                                                                                                                                                                                                                                                                     |
| CERT_SELF_RENEWAL  | Specifies when to renew the server's certificate, expressed as the number of days before the certificate expires. (Default: 30)                                                                                                                                                                                                                                                                          |
| CERT_PROXY_RENEWAL | When the server is requesting certificates as a proxy for other devices, CERT_PROXY_RENEWAL specifies when to renew the proxied certificates, expressed as the number of days before the certificate expires. This number may be different for the proxied devices since they will typically be used in remote areas and may need a longer guaranteed time before the certificate expires. (Default: 60) |
| CERT_PROXY_DOMAINS | A space separated list of domains for which the server is to request certificates. There must be a DNS entry to direct traffic for these domains to the server that is acting as a proxy. All proxy certificates that are created are then uploaded to an AWS S3 bucket for retrieval by the devices for which they were generated.                                                                      |
| AWS_S3_CERT_LOC    | The location of the AWS S3 bucket. (Default: `s3://thecombine.app`)                                                                                                                                                                                                                                                                                                                                      |

### Modes of Operation

The `CERT_MODE` environment variable specifies the mode in which the `certmgr`
container should run:

- `self-signed`: Issue a self-signed certificate. This mode is useful for servers/machines
  that are not accessible from the internet, such as QA servers or development
  machines.
- `letsencrypt`: Use `certbot` to obtain an SSL certificate from _Let's Encrypt_.
- `cert-server`: `cert-server` extends the `letsencrypt` mode. In addition to
  obtaining its own certificate from _Let's Encrypt_, the `certmgr` will also
  obtain certificates for each server/domain listed in `CERT_PROXY_DOMAINS`.

### Script Descriptions

#### entrypoint.py

`entrypoint.py` does the following:

- sets up the sub-directories for volume for storing the certificates
- instantiates the certificate class specified by the `CERT_MODE` environment
  variable.
- calls the certificate's `create` method to create the required certificate
- enters a loop to call the certificate's `renew` method every 12 hours. `renew`
  will `renew` all certificates that are close to expiring.

#### base_cert.py

`base_cert.py` defines an abstract base class for SSL Certificate types.

#### self_signed_cert.py

`self_signed_cert.py` implements the certmgr behavior when `CERT_MODE` is set to
`self-signed`. It creates a self-signed certificate to be used by the nginx web
server and enters a loop to periodically check to see if the certificate needs
to be renewed/recreated. The certificate is valid for 10 years and will be
renewed when there are less than 10 days until is expires.

#### letsencrypt_cert.py

`letsencrypt_cert.py` implements the certmgr behavior when `CERT_MODE` is set to
`letsencrypt`. If there is no certificate or if it was issued by `localhost`,
then `letsencrypt_cert.py` will:

- create a self-signed certificate
- wait for the webserver to come up
- use `certbot` to request a certificate from `letsencrypt` using the webroot
  authentication method
- redirect the webserver configuration to point to the new certificate
  Once there is a letsencrypt certificate, `letsencrypt_cert.py` enters a loop to check
  every 12 hours if the certificate should be renewed.

#### cert_proxy_server.py

`cert_proxy_server.py` implements the certmgr behavior when `CERT_MODE` is set to
`cert-server`. It uses the LetsEncryptCert base class (in `letsencrypt_cert.py)
to obtain its own certificate. It then creates certificates for each specified
proxy and uploads the certificates to an AWS S3 bucket

#### cert_client.py

_Not Implemented Yet_

`cert_client.py` will implement the certmgr behavior when `CERT_MODE` is set to
`cert-client`. It will fetch an SSL certificate from the AWS S3 bucket (when an
internet connection is available).

#### aws.py

`aws.py` is a collection of utility routines for uploading certificates to an S3 bucket
or downloading objects from the bucket.

#### cert_renewal_hook.py

When in `cert-server` mode, `cert_renewal_hook.py` is called each time letsencrypt
renews any of the certificates managed by the server. The hook pushes all the proxy
certs to the S3 bucket.

#### utils.py

`utils.py` is a collection of utility functions used by the different certmgr modes.

## Installation Requirements

The following scenarios list the various requirements for the Ansible playbook
that is used to setup the various targets, `playbook_target_setup.yml` and the
Python script that is used to setup the development environment,
`docker_setup.py`. `docker_setup.py` is only used for setting up a development
environment that uses a self-signed certificate.

When installing TheCombine for using self-signed certificates, e.g. for the QA
server or for development use, the following steps are required:

1. Build each container:
   - frontend
   - backend
   - certbot
2. Install & configure the docker files:
   1. for Linux server (e.g. QA server)
      - run the Ansible script, `playbook_target_setup.yml`
      - connect to the target as the user `combine`
      - cd to `/opt/combine`
      - run `docker-compose up --detach`
   2. for Development mode,
      - cd to the project root directory
      - run `scripts/docker_setup.py`
      - run `docker-compose build`
      - run `docker-compose up --detach`

Note that the machines that are configured to get their certificates from
_Let's Encrypt_ need to have the frontend webserver reloaded in order to switch
from the self-signed certificate to the one from _Let's Encrypt_. To do this,
run:

```
docker-compose exec frontend nginx -s reload
```
