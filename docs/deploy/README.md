# How To Deploy _The Combine_

This document describes how to install the framework that is needed to deploy _The Combine_ to a target Kubernetes
cluster.

<table>
<tr>
 <td>Author/Owner:</td><td>Jim Grady</td>
</tr>
<tr>
 <td>Email:</td><td>jimgrady.jg@gmail.com</td>
</tr>
</table>

## Assumptions

_The Combine_ is designed to be installed on a server on the internet or an organization's intranet or on a standalone
PC such as an Intel NUC. The instructions assume that:

1.  a server already has Kubernetes installed and that the basic infrastucture and namespaces are already configured;
    and
2.  a standalone PC starts with bare hardware.

## Conventions

- the term _NUC_ will be used to describe a target that is a standalone PC. It can be any 64-bit Intel Architecture
  machine.
- most of the commands described in this document are to be run from within the <tt>git</tt> repository for _The
  Combine_ that has been cloned on the host machine. This directory is referred to as \<COMBINE\>.
- the target machine where _The Combine_ is being installed will be referred to as _\<target\>_
- the user on the target machine that will be used for installing docker, etc. will be referred to as _\<target_user\>_.
  You must be able to login to _\<target\>_ as _\<target_user\>_ and _\<target_user\>_ must have `sudo` privileges.

## Contents

1. [Step-by-step Instructions](#step-by-step-instructions)
   1. [Prepare your host system](#prepare-your-host-system)
      1. [Linux Host](#linux-host)
      2. [Windows Host](#windows-host)
   2. [Installing and Running _The Combine_](#installing-and-running-the-combine)
      1. [Minimum System Requirements](#minimum-system-requirements)
      2. [Prepare to Install _The Combine_ on a NUC](#prepare-to-install-the-combine-on-a-nuc)
      3. [Prepare to Install _The Combine_ on a Server](#prepare-to-install-the-combine-on-a-server)
      4. [Install _The Combine_ Cluster](#install-the-combine-cluster)
      5. [Maintenance Scripts for Kubernetes](#maintenance-scripts-for-kubernetes)
      6. [Creating Your Own Inventory File](#creating-your-own-inventory-file)
2. [Automated Backups](#automated-backups)
3. [Design](#design)
4. [Additional Details](#additional-details)
   1. [Install Ubuntu Server](#install-ubuntu-server)
   2. [Vault Password](#vault-password)

# Step-by-step Instructions

This section gives you step-by-step instructions for installing _The Combine_ on a new NUC/PC with links to more
detailed information. The instructions assume that the target system already has Ubuntu Server 20.04 installed and is
accessible via `ssh`.

## Prepare your host system

### Linux Host

Install the following components:

- Ubuntu 20.04 (Desktop or Server), 64-bit
- Git
- [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html#latest-releases-via-apt-ubuntu)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) for examining and modifying your Kubernetes cluster
- [Helm](https://helm.sh/docs/intro/install/) for installing Helm Charts (Kubernetes Packages)
- clone the project repo:
  ```
  git clone https://github.com/sillsdev/TheCombine
  ```
- if you do not have an ssh key pair, create one using:
  ```
  ssh-keygen
  ```
- copy your ssh id to the target system using:
  ```
  ssh-copy-id <target_user>@<target>
  ```

### Windows host

The scripts for installing _The Combine_ use _Ansible_ to manage an installation of _The Combine_. _Ansible_ is not
available for Windows but will run in the Windows Subsystem for Linux (WSL). Microsoft has instructions for installing
WSL on Windows 10 at
[Windows Subsystem for Linux Installation Guide for Windows 10](https://docs.microsoft.com/en-us/windows/wsl/install-win10).
At the end of the instructions there are instructions for installing various Linux images including Ubuntu 20.04.

Once Ubuntu is installed, run the Ubuntu subsystem and follow the instructions for the [Linux Host](#linux-host)

## Installing and Running _The Combine_

To install and start up _The Combine_ you will need to run the following Ansible playbooks. Each time you may be
prompted for passwords:

- `BECOME password` - enter your `sudo` password for the _\<target_user\>_ on the _\<target\>_ machine.
- `Vault password` - some of the Ansible variable files are encrypted in Ansible vaults. See the current owner (above)
  for the Vault password.

### Minimum System Requirements

The minimum system requirements for installing _The Combine_ on a target are:

- Ubuntu 20.04 Server operating system (see [Install Ubuntu Focal Server](#install-ubuntu-focal-server))
- 4 GB RAM
- 32 GB Storage

### Prepare to Install _The Combine_ on a NUC

Install Kubernetes and setup your configuration file for running `kubectl`:

```bash
cd <COMBINE>/deploy
ansible-playbook playbook_kube_install.yml --limit <target> -u <target_user> -K --ask-vault-pass
```

Notes:

- Do not add the `-K` option if you do not need to enter your password to run `sudo` commands _on the target machine_.
- The _\<target\>_ must be listed in the hosts.yml file (in \<COMBINE\>/deploy). If it is not, then you need to create
  your own inventory file (see [below](#creating-your-own-inventory-file)). The _\<target\>_ can be a hostname or a
  group in the inventory file, e.g. `qa`.

### Prepare to Install _The Combine_ on a Server

1. Login to the Kubernetes Dashboard for the Production (or QA) server. You need to have an account on the server that
   was created by the operations group.
2. Copy your `kubectl` configuration to the clipboard and paste it into a file named `~/.kube/{{ kubecfgdir }}/config`.
   `{{ kubecfgdir }}` is defined in `deploy/hosts.yml` for each server. The current values are `prod` for the production
   server and `qa` for the QA server.

### Install _The Combine_ Cluster

To install _The Combine_ run the following command:

```bash
cd <COMBINE>/deploy
ansible-playbook playbook_kube_config.yml --limit <target> --ask-vault-pass
```

Notes:

- You will be prompted for the version of _The Combine_ to install. The version is the Docker image tag in the AWS ECR
  image repository. The standard releases are tagged with the version number, e.g. _0.7.9_.

### Maintenance Scripts for Kubernetes

There are several maintenance scripts that can be run in the kubernetes cluster:

- `combine-backup-job.sh` - performs a backup of _The Combine_ database and backend files, pushes the backup to AWS S3
  storage and then removes old backups keeping the latest 3 backups.
- `combine_backup.py` - just performs the backup and pushes the result to AWS S3 storage.
- `combine-clean-aws.py` - removes the oldest backups, keeping up to `max_backups`. The default for `max_backups` is 3.
- `combine_restore.py` - restores _The Combine_ database and backend files from one of the backups in AWS S3 storage.

The `combine-backup-job.sh` is currently being run daily on _The Combine_ as a Kubernetes CronJob.

In addition to the daily backup, any of the scripts can be run on-demand using the `kubectl` command. Using the
`kubectl` command takes the form:

```
kubectl [--kubeconfig=<path-to-kubernetes-file] [-n thecombine] exec -it deployment/maintenance -- <maintenance script> <script options>
```

Notes:

1. The `--kubeconfig` option is not required if

   1. the `KUBECONFIG` environment variable is set to the path of your kubeconfig file, or

   2. if your kubeconfig file is located in `${HOME}/.kube/config`.

2. You can see the options for a script by running:
   ```
   kubectl [--kubeconfig=<path-to-kubernetes-file] [-n thecombine] exec -it deployment/maintenance -- <maintenance scripts> --help
   ```
   The only exception is `combine-backup-job.sh` which does not have any script options.
3. The `-n thecombine` option is not required if you set `thecombine` as the default namespace for your kubeconfig file
   by running:
   ```
   kubectl config set-context --current --namespace=thecombine
   ```

### Creating Your Own Inventory File

You can create your own inventory file to enable Ansible to install the combine on a target that is not listed in the
hosts.yml inventory file or if you want to override a variable that is used to configure the target.

To use your own inventory file:

- have the filename match the pattern \*.hosts.yml, e.g. dev.hosts.yml, or save it in a directory that is not in the
  combine source tree;
- use hosts.yml as a model. The host will need to be in the `server` or the `qa` group presently. Machines in the `qa`
  group will use a self-signed certificate; machines in the `server` group will get a certificate from letsencrypt and
  must be reachable from the internet.
- define the following variables:

  - combine_server_name:
  - config_captcha_required:
  - config_captcha_sitekey:

  config_captcha_required should be "true" or "false" (including the quotes); if it is "false", config_captcha_sitekey
  can be an empty string.

- add any variables whose default value you want to override.
- to use the custom inventory file, add the following option to the ansible-playbook commands above:
  `-i custom-inventory.yml` where `custom-inventory.yml` is the name of the inventory file that you created.

See the Ansible documentation,
[Build Your Inventory](https://docs.ansible.com/ansible/latest/network/getting_started/first_inventory.html) for more
information on inventory files.

# Automated Backups

If the ansible variables `backup_hours` and `backup_minutes` are defined for a target, then `cron` will be setup to
create a backup of _The Combine_ database and backend files every day at the specified times. The hours/minutes can be
set to any string that is recognized by `cron`. The backups are stored in an Amazon S3 bucket.

# Design

Please see the Kubernetes Design document at [./kubernetes_design/README.md](./kubernetes_design/README.md)

# Additional Details

## Install Ubuntu Server

To install the OS on a new target machine, such as, a new NUC, follow these steps:

1. Download the ISO image for Ubuntu Server from Ubuntu (currently at https://ubuntu.com/download/server; click on
   _Option 2 - Manual server installation_ and then _Download Ubuntu Server 20.04.3 LTS_)

2. copy the .iso file to a bootable USB stick:

   1. Ubuntu host: Use the _Startup Disk Creator_, or
   2. Windows host: follow the
      [tutorial](https://ubuntu.com/tutorials/tutorial-create-a-usb-stick-on-windows#1-overview) on ubuntu.com.

3. Boot the PC from the bootable media and follow the installation instructions. In particular,

   1. You will want the installer to format the entire \[virtual\] disk. Using LVM is not recommended.

   2. Make sure that you install the OpenSSH server when prompted:
      ![alt text](images/ubuntu-software-selection.png "Ubuntu Server Software Selection")

      In addition, you may have your SSH keys from _Github_ or _Launchpad_ preinstalled as authorized keys.

   3. You do not need to install any additional snaps; the _Ansible_ playbooks will install any needed software

4. Update all packages:
   ```
   sudo apt update && sudo apt upgrade -y
   ```
5. Reboot:
   ```
   sudo reboot
   ```

## Vault Password

The Ansible playbooks require that some of the variable files are encrypted. When running one of the playbooks, you will
need to provide the password for the encrypted files. The password can be provided by:

1. entering the password when prompted. Add the <tt>--ask-vault-pass</tt> option for <tt>ansible-playbook</tt> to be
   prompted for the password when it is required.
2. specify a file that has the password. Add the <tt>--vault-password-file</tt> option for <tt>ansible-playbook</tt>
   followed by the path of a file that holds the vault password.
3. set the environment variable <tt>ANSIBLE_VAULT_PASSWORD_FILE</tt> to the path of a file that holds the vault
   password. This prevents you from needing to provide the vault password whenever you run an ansible playbook, either
   directly or from within a script such as <tt>setup-nuc.sh</tt>.

If you use a file to hold the vault password, then:

- _Make sure that you are the only one with read permission for the password file!_
- _Make sure that the password file is not tracked in the git repository!_

For example, use hidden file in your home directory, such as <tt>\$HOME/.ansible-vault</tt>, with mode of <tt>0600</tt>.
