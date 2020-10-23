# Design notes for the certbot container for TheCombine

## Certificate storage

The certificates are stored in a docker volume.  The volume is named letsencrypt
and is mounted by the `frontend` and the `certmgr` containers.  Both containers mount
the volume at `/etc/letsencrypt`.

At the top level, there are 3 directories in `/etc/letsencrypt`:
 - `letsencrypt` - stores the certificates created by letsencrypt and managed by `certbot`.
   `/etc/letsencrypt` is created as a symbolic link to `/etc/letsencrypt/letsencrypt`
 - `nginx` - The Nginx web server is configured to read its SSL certificates from:
   - SSL Certificate: `/etc/letsencrypt/nginx/<server_name>/fullchain.pem`
   - SSL Private Key: `/etc/letsencrypt/nginx/<server_name>/privkey.pem`

   This is implemented by setting up `/etc/letsencrypt/nginx/ssl/<server_name>` as a
   symbolic link to the self-signed or letsencrypt certificates.
 - `selfsigned` - stores a self-signed certificate for the server in
   `/etc/letsencrypt/selfsigned/<server_name>`

## Entrypoint scripts for the certbot container for TheCombine

### Environment Variables

The following environment variables are used by the certmgr to control its
behavior:

| Variable Name     | Description                                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| CERT_MODE         | May be one of `self-signed`, `letsencrypt`, `cert-server`, or `cert-client` to specify which of the certificate management personalities to use |
| CERT_EMAIL        | Set to e-mail address for certificate expiration notices first                                                                                                       |
| CERT_STAGING      | Primary domain for the certificate - used to specify location of certificate                                                                    |
| CERT_DOMAINS      | A space separated list of domains for the certificate.                                                                                          |
| CERT_VERBOSE      | Set to 1 for verbose output to aid in debugging; 0 otherwise.                                                                                   |
| SERVER_NAME       | Name of the server - used to specify the directory where the certificates are stored.                                                           |
| MAX_CONNECT_TRIES | Number of times to check if the webserver is up before attempting to get a certificate from letsencrypt.                                        |

### selfsigned.sh
`selfsigned.sh` implements the certmgr behavior when `CERT_MODE` is set to
`self-signed`. It creates a self-signed certificate to be used by the nginx web
server and enters a loop to periodically check to see if the certificate needs
to be renewed/recreated.  The certificate is valid for 10 years and will be
renewed when there are less than 10 days until is expires.

### letsencrypt.sh
`letsencrypt.sh` implements the certmgr behavior when `CERT_MODE` is set to
`letsencrypt`.  If there is no certificate or if it was issued by `localhost`,
then `letsencrypt.sh` will:
 - create a self-signed certificate
 - wait for the webserver to come up
 - use `certbot` to request a certificate from `letsencrypt` using the webroot
   authentication method
 - redirect the webserver configuration to point to the new certificate
Once there is a letsencrypt certificate, `letsencrypt.sh` enters a loop to check
every 12 hours if the certificate should be renewed.

### certserver.sh
*Not Implemented Yet*

`certserver.sh` will implement the certmgr behavior when `CERT_MODE` is set to
`cert-server`. It will create multiple certificates and push them to an AWS S3 bucket

### certclient.sh
*Not Implemented Yet*

`certclient.sh` will implement the certmgr behavior when `CERT_MODE` is set to
`cert-client`.  It will fetch an SSL certificate from the AWS S3 bucket (when an
internet connection is available).

## Installation Requirements

The following scenarios list the various requirements for the Ansible playbook
that is used to setup the various targets, `playbook_target_setup.yml` and the
Python script that is used to setup the development environment,
`docker_setup.py`.  `docker_setup.py` is only used for setting up a development
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
from the self-signed certificate to the one from _Let's Encrypt_.   To do this,
run:
```
docker-compose exec frontend nginx -s reload
```
