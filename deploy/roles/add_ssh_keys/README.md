# Ansible Role: add_ssh_keys

This role will install a set of public keys as authorized users for a specified
user.  It is intended to work in conjunction with a playbook that gets the
puclic key for the root user on a NUC so that the site certificate can be
updated from a server that has renewed the certificate.

## Required Variables

*cert_server_user* user on the target system whose authorized users are updated by this role

*cert_server_login_key_path* path where the public keys for the authorized users are located.  The path is relative to the parent of the `roles` directory.  Public keys filenames must match the pattern `*.pub`.
