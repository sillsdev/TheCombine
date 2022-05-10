# How To Deploy _The Combine_

This document describes how to deploy _The Combine_ to a target Kubernetes cluster.

## Assumptions

_The Combine_ is designed to be installed on a server on the internet or an organization's intranet or on a standalone
PC such as an Intel NUC. The instructions assume that:

1. a server already has Kubernetes installed and that the basic infrastructure and namespaces are already configured;
   and
2. a standalone PC is running an up-to-date version of Ubuntu Server with an OpenSSH server running.

## Conventions

- the term _NUC_ will be used to describe a target that is a standalone PC. It can be any 64-bit Intel Architecture
  machine.
- most of the commands described in this document are to be run from within the `git` repository for _The Combine_ that
  has been cloned on the host machine. This directory is referred to as \<COMBINE\>.
- the target machine where _The Combine_ is being installed will be referred to as _\<target\>_
- the user on the target machine that will be used for installing docker, etc. will be referred to as _\<target_user\>_.
  You must be able to log in to _\<target\>_ as _\<target_user\>_ and _\<target_user\>_ must have `sudo` privileges.

## Contents

1. [Step-by-step Instructions](#step-by-step-instructions)
   1. [Prepare your host system](#prepare-your-host-system)
      1. [Linux Host](#linux-host)
   2. [Installing Kubernetes and Initializing Your Cluster](#installing-kubernetes-and-initializing-your-cluster)
      1. [Minimum System Requirements](#minimum-system-requirements)
      2. [Installing Kubernetes](#installing-kubernetes)
   3. [Installing _The Combine_ Helm Charts](#installing-the-combine-helm-charts)
      1. [Setup](#setup)
      2. [Install _The Combine_ Cluster](#install-the-combine-cluster)
   4. [Maintenance Scripts for Kubernetes](#maintenance-scripts-for-kubernetes)
   5. [Creating Your Own Inventory File](#creating-your-own-inventory-file)
2. [Automated Backups](#automated-backups)
3. [Design](#design)
4. [Additional Details](#additional-details)
   1. [Install Ubuntu Server](#install-ubuntu-server)
   2. [Vault Password](#vault-password)

## Step-by-step Instructions

### Prepare your host system

_The Combine_ can be installed on a system that already has Kubernetes installed from any host system type. This is the
normal case for the QA and Live servers that are managed by the Operations Team. To install _The Combine_ to an existing
Kubernetes cluster, you will need the following tools:

- Git
- [kubectl](https://kubernetes.io/docs/tasks/tools/) for examining and modifying your Kubernetes cluster
- [Helm](https://helm.sh/docs/intro/install/) for installing Helm Charts (Kubernetes Packages)
- [Docker](https://docs.docker.com/get-docker/) or [Docker Desktop](../../README.md#docker-desktop-for-linux)
- Python - See the project [README](../../README.md#python) for instructions on how to setup Python and the virtual
  environment
- clone the project repo:

  ```bash
  git clone https://github.com/sillsdev/TheCombine
  ```

#### Linux Host

Some extra tools are required to setup a machine that does not have an existing Kubernetes cluster. The methods
described here must be performed on a Linux host.

The extra tools that are needed are:

- [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html#latest-releases-via-apt-ubuntu)

### Installing Kubernetes and Initializing Your Cluster

This section describes how to install Kubernetes and start the Kubernetes cluster on the target system. If you are
installing _The Combine_ on an existing cluster, skip this section and go to
[Installing _The Combine_ Helm Charts](#installing-the-combine-helm-charts).

#### Minimum System Requirements

The minimum target system requirements for installing _The Combine_ are:

- Ubuntu 20.04 Server operating system (22.04 is recommended). See [Install Ubuntu Server](#install-ubuntu-server).
- 4 GB RAM
- 32 GB Storage

#### Installing Kubernetes

This section covers how to install Kubernetes and prepare the cluster for installing _The Combine_. If you are
installing/upgrading _The Combine_ on the QA server or the Production (or Live) server, skip to the next section. These
systems are managed and prepared by the Operations Team.

For the NUCs or other test systems that are managed by the development team, we will install, [k3s](https://k3s.io/), a
lightweight, Kubernetes engine from Rancher. When that is installed, we will create the namespaces that are needed for
_The Combine_.

Note that these steps need to be done from a Linux host machine with Ansible installed.

1. First, setup ssh access to the target if it has not been done already:

   1. If you do not have an ssh key pair, create one using:

      ```bash
      ssh-keygen
      ```

   2. Copy your ssh id to the target system using:

      ```bash
      ssh-copy-id <target_user>@<target>
      ```

2. To install Kubernetes and setup your configuration file for running `kubectl`, run this command from the `deploy`
   folder in the project:

   ```bash
   ansible-playbook playbook_kube_install.yml --limit <target> -u <target_user> -K --ask-vault-pass
   ```

   **Notes:**

   - Do not add the `-K` option if you do not need to enter your password to run `sudo` commands _on the target
     machine_.
   - The _\<target\>_ must be listed in `<COMBINE>/deploy/hosts.yml`. If it is not, then you need to create your own
     inventory file (see [below](#creating-your-own-inventory-file)).
   - The _\<target\>_ can be a hostname or a group in the inventory file, e.g. `qa`.
   - Each time you may be prompted for passwords:
   - `BECOME password` - enter your `sudo` password for the _\<target_user\>_ on the _\<target\>_ machine.
   - `Vault password` - some of the Ansible variable files are encrypted in Ansible vaults. If you need the Ansible
     vault password, send a request explaining your need to [admin@thecombine.app](mailto:admin@thecombine.app).

   When the playbook has finished the installation, it will have installed a `kubectl` configuration file on your host
   machine in `${HOME}/.kube/<target>/config`.

3. Setup the `kubectl` config file for the target for the steps that follow. There are several ways to do this:

   1. If you have no other targets that you are working with, copy/move/link the configuration file to `~/.kube/config`
   2. setup an environment variable to specify the `kubeconfig` file:

      ```bash
      export KUBECONFIG=~/.kube/<target>/config
      ```

      where `<target>` is the name of the target that was installed, e.g. `nuc1`

   3. Add `--kubeconfig=~/.kube/<target>/config` to each `helm` and `kubectl` command. The `setup_combine.py` command
      accepts a `kubeconfig` option as well.

4. Install the charts needed for _The Combine_

   From the project directory with an activated _Python_ virtual environment, run:

   ```bash
   python deploy/scripts/setup_cluster.py --type nuc
   ```

### Installing _The Combine_ Helm Charts

#### Setup

If you do not have a `kubectl` configuration file for the _\<target\>_ system, you need to install it. For the NUCs, it
is setup automatically by the Ansible playbook run in the previous section.

For the Production or QA server,

1. login to the Rancher Dashboard for the Production (or QA) server. You need to have an account on the server that was
   created by the operations group.
2. Copy your `kubectl` configuration to the clipboard and paste it into a file on your host machine, e.g.
   `${HOME}/.kube/prod/config` for the production server.
3. Setup the following environment variables:

   - AWS_ACCOUNT
   - AWS_DEFAULT_REGION
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - COMBINE_JWT_SECRET_KEY
   - COMBINE_SMTP_USERNAME
   - COMBINE_SMTP_PASSWORD

   These can be set in your `.profile` (Linux or Mac 10.14-), your `.zprofile` (Mac 10.15+), or the _System_ app
   (Windows). If you are a member of the development team and need the environment variable values, send a request
   explaining your need to [admin@thecombine.app](mailto:admin@thecombine.app).

4. Set the KUBECONFIG environment variable to the location of the `kubectl` configuration file. (This is not necessary
   if the configuration file is at `${HOME}/.kube/config.)

#### Install _The Combine_ Cluster

To install/upgrade _The Combine_ change directory to the project root directory and run the following command within
your Python virtual environment:

```bash
python deploy/scripts/setup_combine.py
```

Notes:

- You will be prompted for the _target_ where _The Combine_ is to be installed as well as version to install. The
  version is the Docker image tag in the AWS ECR image repository. The standard releases are tagged with the version
  number, e.g. _0.7.15_.
- The _target_ must be one listed in `<COMBINE>/deploy/scripts/setup_files/config.yaml`.
- Run `python deploy/scripts/setup_combine.py --help` for additional options such as specifying a different
  configuration file for additional targets.

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

```bash
kubectl [--kubeconfig=<path-to-kubernetes-file] [-n thecombine] exec -it deployment/maintenance -- <maintenance script> <script options>
```

Notes:

1. The `--kubeconfig` option is not required if

   1. the `KUBECONFIG` environment variable is set to the path of your kubeconfig file, or

   2. if your kubeconfig file is located in `${HOME}/.kube/config`.

2. You can see the options for a script by running:

   ```bash
   kubectl [--kubeconfig=<path-to-kubernetes-file] [-n thecombine] exec -it deployment/maintenance -- <maintenance scripts> --help
   ```

   The only exception is `combine-backup-job.sh` which does not have any script options.

3. The `-n thecombine` option is not required if you set `thecombine` as the default namespace for your kubeconfig file
   by running:

   ```bash
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

## Automated Backups

If the ansible variables `backup_hours` and `backup_minutes` are defined for a target, then `cron` will be setup to
create a backup of _The Combine_ database and backend files every day at the specified times. The hours/minutes can be
set to any string that is recognized by `cron`. The backups are stored in an Amazon S3 bucket.

## Design

Please see the Kubernetes Design document at [./kubernetes_design/README.md](./kubernetes_design/README.md)

## Additional Details

### Install Ubuntu Server

To install the OS on a new target machine, such as, a new NUC, follow these steps:

1. Download the ISO image for Ubuntu Server from Ubuntu (currently at <https://ubuntu.com/download/server>; click on
   _Option 2 - Manual server installation_ and then _Download Ubuntu Server 22.04 LTS_)

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

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

5. Reboot:

   ```bash
   sudo reboot
   ```

### Vault Password

The Ansible playbooks require that some of the variable files are encrypted. When running one of the playbooks, you will
need to provide the password for the encrypted files. The password can be provided by:

1. entering the password when prompted. Add the `--ask-vault-pass` option for `ansible-playbook` to be prompted for the
   password when it is required.
2. specify a file that has the password. Add the `--vault-password-file` option for `ansible-playbook` followed by the
   path of a file that holds the vault password.
3. set the environment variable `ANSIBLE_VAULT_PASSWORD_FILE` to the path of a file that holds the vault password. This
   prevents you from needing to provide the vault password whenever you run an ansible playbook.

If you use a file to hold the vault password, then:

- _Make sure that you are the only one with read permission for the password file!_
- _Make sure that the password file is not tracked in the git repository!_

For example, use hidden file in your home directory, such as `${HOME}/.ansible-vault`, with mode of `0600`.
