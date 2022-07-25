# How To Deploy _The Combine_

This document describes how to deploy _The Combine_ to a target Kubernetes cluster.

## Conventions

- the _host_ machine is the machine that is used to perform the installation. It may be a Linux, Windows, or MacOS
  machine.
- the _target_ machine is the machine where _The Combine_ is to be installed. It shall be referred to as _\<target\>_.
- some of the commands described in this document are to be run from within the `git` repository for _The Combine_ that
  has been cloned on the host machine. This directory shall be referred to as \<COMBINE\>.

## Contents

1. [System Design](#system-design)
2. [Host System Requirements](#host-system-requirements)
3. [Deployment Scenarios](#deployment-scenarios)
   1. Development Environment
   2. QA/Production Server
   3. NUC
   4. Other Systems
4. Install Ubuntu Server
5. Install Kubernetes Engine
6. Install Helm Charts Required by _The Combine_
7. Install _The Combine_
8. Maintenance
   1. Maintenance Scripts
   2. Automated Backups
   3. Creating your own Configurations
      1. Ansible Inventory file
      2. Combine Configuration file

## System Design

_The Combine_ is designed as a collection of helm charts to be installed on a Kubernetes cluster. _The Combine's_
Kubernetes resources are described in the design document at
[./kubernetes_design/README.md](./kubernetes_design/README.md).

## Deployment Scenarios

The tools and methods for deploying _The Combine_ are a function of the type of system you wish to deploy, the
_deployment scenario_ and the operating system of the host machine.

### Development Environment

The _Development Environment_ scenario is for software developers who need to test out changes to the application in
development before they are deployed. This allows the developer to deploy _The Combine_ to a local Kubernetes
environment that is closer to the production environment. The tools and methods for deploying _The Combine_ in a
development environment are described in the
[Setup Local Kubernetes Cluster](https://github.com/sillsdev/TheCombine#setup-local-kubernetes-cluster) section of the
project README.md file.

### QA/Production Server

For _The Combine_, the QA and Production servers are servers where the Kubernetes Cluster is created and maintained by a
separate organization. The characteristics of these systems are:

- The Kubernetes cluster has been created as follows:

  - [cert-manager](https://cert-manager.io/) is installed
  - an NGINX ingress controller is installed
  - the namespace `thecombine` is created
  - the TLS certificate for the server is installed in `thecombine` namespace as a `kubernetes.io/tls` secret with the
    name `thecombine-app-tls`

- The QA server has services to login to a private AWS Elastic Container Registry to run private images for _The
  Combine_. In contrast, the Production server only runs public images.
- On the Production server an additional namespace `combine-cert-proxy`.

#### Tools Required for a QA/Production Server Installation

The host tools required to install _The Combine_ on a QA or Production server are described in
[Install Kubernetes Tools](https://github.com/sillsdev/TheCombine#install-kubernetes-tools) in the project README.md
file.

#### Steps to Install on a QA/Production Server

To install _The Combine_ on one of these systems, follow the steps in

- [Install _The Combine_](#install-the-combine)

### NUC

_The Combine_ is designed to be installed on an _Intel NUC_ or other mini-computer and to operate where no internet is
available. The installation process assumes that a WiFi interface is available as well as a wired Ethernet interface.

#### Tools Required to Install on a NUC

There are two options for toolsets to install _The Combine_ on a NUC:

##### Locally Installed Tools

Locally installed tools can be used to install from a Linux or MacOS host machine. The required tools are:

- _The Combine_ source tree

  Clone the repo:

  ```bash
  git clone https://github.com/sillsdev/TheCombine.git
  ```

- [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html#latest-releases-via-apt-ubuntu)
- Python: See the instructions for installing Python and dependent libraries in the project
  [README.md](https://github.com/sillsdev/TheCombine#python)
- [Docker Engine](https://docs.docker.com/engine/install/) or [Docker Desktop](https://docs.docker.com/get-docker/)

##### Install From Docker Image

You can use a Docker image to install _The Combine_ using a host machine running Windows, Linux, or MacOS. The only tool
that is needed is Docker itself: [Docker Engine](https://docs.docker.com/engine/install/) or
[Docker Desktop](https://docs.docker.com/get-docker/)

Once you have installed _Docker_, pull the image that we will be using. Open a terminal window (PowerShell, Command
Prompt, or Unix shell) and run:

```console
docker pull public.ecr.aws/thecombine/combine_deploy:latest
```

The Docker image contains all the additional tools that are needed. It also has all of the installation scripts so that
you do not need to clone _The Combine's_ GitHub repo. The disadvantage of using the Docker image is that any changes to
configuration files will not be preserved. This is not a concern for most users.

#### Steps to Install on a NUC

To install _The Combine_ on one of these systems, follow the steps in

- [Install Ubuntu Server](#install-ubuntu-server)
- [Install Kubernetes Engine](#install-kubernetes-engine)
- [Install Helm Charts Required by _The Combine_](#install-helm-charts-required-by-the-combine)
- [Install _The Combine_](#install-the-combine)

## Install Ubuntu Server

Note: In the instructions below, each step indicates whether the step is to be performed on the Host PC (_[Host]_) or
the target PC (_[NUC]_).

To install the OS on a new target machine, such as, a new NUC, follow these steps:

1. _[Host]_ Download the ISO image for Ubuntu Server from Ubuntu (currently at <https://ubuntu.com/download/server>;
   click on _Option 2 - Manual server installation_ and then _Download Ubuntu Server 22.04 LTS_)

2. _[Host]_ copy the .iso file to a bootable USB stick:

   1. Ubuntu host: Use the _Startup Disk Creator_, or
   2. Windows host: follow the
      [tutorial](https://ubuntu.com/tutorials/tutorial-create-a-usb-stick-on-windows#1-overview) on ubuntu.com.

3. _[NUC]_ Connect the NUC to a wired, Ethernet network connection, an HDMI Display and a USB Keyboard.

4. _[NUC]_ Boot the NUC from the bootable media and follow the installation instructions. In particular,

   1. You will want the installer to format the entire disk. Using LVM is not recommended.

   2. Profile setup

      The instructions assume the following profile entries during installation:

      | Item             | Value                             |
      | ---------------- | --------------------------------- |
      | Your Name        | SIL Language Software Development |
      | Your Server Name | nuc1, nuc2, or nuc3               |
      | Pick a username  | sillsdev                          |

      You may choose any name, username that you like. If you use a different servername than one of the three listed,
      you will need to provide alternate configuration files. See the [Advanced Configuration](#advanced-configuration)
      section. This is not recommended when running the installation from a Docker image.

   3. Make sure that you install the OpenSSH server when prompted:
      ![alt text](images/ubuntu-software-selection.png "Ubuntu Server Software Selection")

      In addition, you may have your SSH keys from _Github_ or _Launchpad_ preinstalled as authorized keys.

   4. You do not need to install any additional snaps; the _Ansible_ playbooks will install any needed software.

5. _[NUC]_ When installation is complete, log into the NUC using the username and password provided during installation
   and update all packages:

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

6. _[NUC]_ Reboot:

   ```bash
   sudo reboot
   ```

7. _[NUC]_ Lookup IP Address for the NUC:

   From the NUC, run the command `ip address`. Record the current IP address for the Ethernet interface; the Ethernet
   interface starts with `en`, followed by a letter and then a digit (`en[a-z][0-9]`).

8. _[Host]_ Setup your host's connection to the NUC:

   - if using the Docker image open a terminal window and run:

     ```console
     docker run -it -v nuc-config:/config public.ecr.aws/thecombine/combine_deploy:latest
     setup_target.py <ip_addr> <target>
     ```

     Where `<ip_addr>` is the IP address found in step 7 and `<target>` is the server name specified when Ubuntu was
     installed.

   - if using local tools, open a terminal window and run:

     ```console
     sudo deploy/scripts/setup_target.py <ip_addr> <target>
     ```

   The `setup_target.py` script will do the following:

   - Add the NUC's IP address to your `/etc/hosts` file
   - Generate an SSH key for you
   - Copy your SSH public key to the NUC

## Install Kubernetes Engine

## Install Helm Charts Required by _The Combine_

## Install _The Combine_

## Maintenance

### Maintenance Scripts

### Automated Backups

### Creating your own Configurations

#### Ansible Inventory file

#### Combine Configuration file

1. [Step-by-step Instructions](#step-by-step-instructions)
   1. [Choose your Installation Method](#choose-your-installation-method)
   1. [Prepare your host system](#prepare-your-host-system)
      1. [Linux Host](#linux-host)
   1. [Installing Kubernetes and Initializing Your Cluster](#installing-kubernetes-and-initializing-your-cluster)
      1. [Minimum System Requirements](#minimum-system-requirements)
      2. [Installing Kubernetes](#installing-kubernetes)
   1. [Installing _The Combine_ Helm Charts](#installing-the-combine-helm-charts)
      1. [Setup](#setup)
      2. [Install _The Combine_ Cluster](#install-the-combine-cluster)
   1. [Maintenance Scripts for Kubernetes](#maintenance-scripts-for-kubernetes)
   1. [Creating Your Own Inventory File](#creating-your-own-inventory-file)
2. [Automated Backups](#automated-backups)
3. [Design](#design)
4. [Install Ubuntu Server](#install-ubuntu-server)

## Step-by-step Instructions

### Choose your Installation Method

There are two methods for setting up _The Combine_ on a target system, setting up the tools on your host system or
running the installation from a Docker container.  
The Docker container method is required for Windows hosts that need to setup a system where Kubernetes is not already
installed, such as a bare NUC.

The advantage of setting up the tools on your host system is that the configuration is persistent; with the Docker
container, setup steps need to be repeated when the container is restarted.

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
   ansible-playbook playbook_kube_install.yml --limit <target> -u <target_user> -K
   ```

   **Notes:**

   - Do not add the `-K` option if you do not need to enter your password to run `sudo` commands _on the target
     machine_.
   - The _\<target\>_ must be listed in `<COMBINE>/deploy/hosts.yml`. If it is not, then you need to create your own
     inventory file (see [below](#creating-your-own-inventory-file)).
   - The _\<target\>_ can be a hostname or a group in the inventory file, e.g. `qa`.
   - Each time you may be prompted for passwords:
   - `BECOME password` - enter your `sudo` password for the _\<target_user\>_ on the _\<target\>_ machine.

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
   if the configuration file is at `${HOME}/.kube/config`.)

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

## Install Ubuntu Server
