# How To Deploy _The Combine_

This document describes how to deploy _The Combine_ to a target Kubernetes cluster.

## Conventions

- the _host_ machine is the machine that is used to perform the installation. It may be a Linux, Windows, or MacOS
  machine.
- the _target_ machine is the machine where _The Combine_ is to be installed.
- some of the commands described in this document are to be run from within the `git` repository for _The Combine_ that
  has been cloned on the host machine. This directory shall be referred to as `<COMBINE>`.

## Contents

1. [System Design](#system-design)
2. [Deployment Scenarios](#deployment-scenarios)
   1. [Development Environment](#development-environment)
   2. [QA/Production Server](#qaproduction-server)
   3. [NUC](#nuc)
3. [Install Ubuntu Server on Target](#install-ubuntu-server-on-target)
4. [Setup Target](#setup-target)
5. [Install Kubernetes Engine on Target](#install-kubernetes-engine-on-target)
6. [Setup Kubectl and Environment](#setup-kubectl-and-environment)
   1. [Setup Kubectl](#setup-kubectl)
   2. [Setup Environment](#setup-environment)
7. [Install Helm Charts Required by _The Combine_](#install-helm-charts-required-by-the-combine)
8. [Install _The Combine_](#install-the-combine)
9. [Maintenance](#maintenance)
   1. [Maintenance Scripts for Kubernetes](#maintenance-scripts-for-kubernetes)
   2. [Checking Certificate Expiration](#checking-certificate-expiration)
   3. [Creating your own Configurations](#creating-your-own-configurations)

## System Design

_The Combine_ is designed as a collection of helm charts to be installed on a Kubernetes cluster. _The Combine's_
Kubernetes resources are described in the design document at
[./kubernetes_design/README.md](./kubernetes_design/README.md).

## Deployment Scenarios

The tools and methods for deploying _The Combine_ are a function of the type of system you wish to deploy, the
_deployment scenario_, and the operating system of the host machine.

### Development Environment

The _Development Environment_ scenario is for software developers who need to test out changes to the application in
development before they are deployed. This allows the developer to deploy _The Combine_ to a local Kubernetes
environment that is closer to the production environment. The tools and methods for deploying _The Combine_ in a
development environment are described in the
[Setup Local Kubernetes Cluster](https://github.com/sillsdev/TheCombine#setup-local-kubernetes-cluster) section of the
project README.md file.

### QA/Production Server

For _The Combine_, the QA and Production servers are servers where the Kubernetes Cluster is created and maintained by
LTOps. The characteristics of these systems are:

- To access these clusters, you will need a WireGuard tunnel config from LTOps.

  - On Windows: you can use the [WireGuard app](https://www.wireguard.com/install/) to add a new tunnel from a config
    file.
  - On Linux: `sudo apt install wireguard`, then move the `.conf` file to `/etc/wireguard/<tunnel-name>.conf`, then run
    `sudo wg-quick up <tunnel-name>`. (The last command will have to be run again if you reboot.)

- The Kubernetes cluster has been created as follows:

  - [cert-manager](https://cert-manager.io/) is installed
  - an NGINX ingress controller is installed
  - the namespace `thecombine` is created
  - the TLS certificate for the server is installed in `thecombine` namespace as a `kubernetes.io/tls` secret with the
    name `thecombine-app-tls`
  - PersistentVolumeClaims for `backend-data`, `database-data`, and `font-data`

- The QA server has services to login to a private AWS Elastic Container Registry to run private images for _The
  Combine_. In contrast, the Production server only runs public images.
- The Production server has an additional namespace `combine-cert-proxy`.

The host tools required to install _The Combine_ on a QA or Production server are described in
[Install Kubernetes Tools](https://github.com/sillsdev/TheCombine#install-kubernetes-tools) in the project README.md
file.

#### Steps to Install on a QA/Production Server

To install _The Combine_ on one of these systems, follow the steps in

- [Setup Kubectl and Environment](#setup-kubectl-and-environment)
- [Install _The Combine_](#install-the-combine)

### NUC

_The Combine_ is designed to be installed on an _Intel NUC_ or other mini-computer and to operate where no internet is
available. The installation process assumes that a WiFi interface is available as well as a wired Ethernet interface.

There are two options for installing _The Combine_ on a NUC: local tools and Docker image.

#### Install with Local Tools

Locally installed tools can be used to install from a Linux, MacOS, or Windows Subsystem for Linux (WSL) host machine.
The required tools are:

- _The Combine_ source tree; clone the repo:

  ```bash
  git clone https://github.com/sillsdev/TheCombine.git
  ```

- [Docker Engine](https://docs.docker.com/engine/install/) or [Docker Desktop](https://docs.docker.com/get-docker/)
- Python: See the instructions for installing Python and dependent libraries in the project
  [README.md](https://github.com/sillsdev/TheCombine#python)
- Ansible: You can
  [install ansible directly](https://docs.ansible.com/ansible/latest/installation_guide/installation_distros.html), or
  you can sync `<COMBINE>/deploy/requirements.txt` in your Python virtual environment (venv).

#### Install from Docker Image

You can use a Docker image to install _The Combine_ using a host machine running Windows, Linux, or MacOS. The only tool
that is needed is Docker. You can install either [Docker Engine](https://docs.docker.com/engine/install/) or
[Docker Desktop](https://docs.docker.com/get-docker/)

Once you have installed _Docker_, pull the `combine_deploy` image. Open a terminal window (PowerShell, Command Prompt,
or Unix shell) and run:

```console
docker pull public.ecr.aws/thecombine/combine_deploy:latest
```

The Docker image contains all the additional tools that are needed. It also has all of the installation scripts so that
you do not need to clone _The Combine's_ GitHub repo. The disadvantage of using the Docker image is that any changes to
_The Combine_ configuration files will not be preserved. This is not a concern for most users.

##### Open Docker Image Terminal

To open the Docker image terminal, run:

```console
docker run -it -v nuc-config:/config public.ecr.aws/thecombine/combine_deploy:latest
```

You should see something like `root@18a8f5cf1e86:/#` in the terminal.

#### Steps to Install on a NUC

To install _The Combine_ on one of these systems, follow the steps in

- [Install Ubuntu Server on Target](#install-ubuntu-server-on-target)
- [Setup Target](#setup-target)
- [Install Kubernetes Engine on Target](#install-kubernetes-engine-on-target)
- [Setup Kubectl and Environment](#setup-kubectl-and-environment)
- [Install Helm Charts Required by _The Combine_](#install-helm-charts-required-by-the-combine)
- [Install _The Combine_](#install-the-combine)

## Install Ubuntu Server on Target

Note: In the instructions below, each step indicates whether the step is to be performed on the host PC (_[Host]_) or
the target PC (_[NUC]_).

To install the OS on a new target machine, such as, a new NUC, follow these steps:

1. _[Host]_ Download the ISO image for Ubuntu Server 24.04 from Ubuntu (currently at
   <https://ubuntu.com/download/server>).

2. _[Host]_ copy the .iso file to a bootable USB stick:

   1. Ubuntu host: Use the _Startup Disk Creator_ (`sudo apt install usb-creator-gtk`), or
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

      You may choose any name, username that you like. If you use a different server name than one of the three listed,
      you will need to provide alternate configuration files. See the
      [Creating your own Configurations](#creating-your-own-configurations) section. This is not recommended when
      running the installation from a Docker image.

   3. Make sure that you install the OpenSSH server when prompted:

      ![alt text](images/ubuntu-software-selection.png "Ubuntu Server Software Selection")

      In addition, you may have your SSH keys from _Github_ or _Launchpad_ preinstalled as authorized keys.

      Make sure that `Allow password authentication over SSH` is checked even if you import SSH identities. This will
      make administration in the field easier.

   4. You do not need to install any additional snaps; the _Ansible_ playbooks will install any needed software.

5. _[NUC]_ When installation is complete, log into the NUC using the username and password provided during installation
   and update all packages:

   ```console
   sudo apt update && sudo apt upgrade -y
   ```

6. _[NUC]_ Reboot:

   ```console
   sudo reboot
   ```

### Setup values

The next two steps ([Setup Target](#setup-target) and
[Install Kubernetes Engine on Target](#install-kubernetes-engine-on-target)) use the following variables.

- `<ip_addr>` is the target's ip address. From the NUC, run the command `ip address`. Record the current IP address for
  the Ethernet interface; the Ethernet interface starts with `en`, followed by a letter and then a digit, then possibly
  another letter and a number (`en[a-z][0-9]([a-z][0-9]+)?])`).

- `<target>` is the target's server name. This was chosen during profile setup above. If you don't recall which of
  nuc1/nuc2/nuc3 was used, run the command `hostname` on the NUC.

- `<target_user>` is the username on the target, chosen during profile setup above (default is `sillsdev`).

- `<host_user>` is your current username on the host PC.

## Setup Target

Setup your host's connection to the NUC. This setup is all run from _[Host]_.

If using the Docker image, [open the Docker image terminal](#open-docker-image-terminal) and run:

```console
python3 ~/scripts/setup_target.py <ip_addr> <target> [-t <target_user>]
```

If using local tools, open a terminal window and run:

```console
cd <COMBINE>/deploy/scripts
sudo ./setup_target.py <ip_addr> <target> -l <host_user> [-t <target_user>]
```

The values for `<ip_addr>`, `<target>`, `<host_user>`, and `<target_user>` are specified in
[Setup Values](#setup-values) above. The `-t <target_user>` is not required if the default username (`sillsdev`) was
used on the target.

The `setup_target.py` script will do the following:

- Add the NUC's IP address to your `/etc/hosts` file
- Generate an SSH key for you
- Copy your SSH public key to the NUC

Note that if an SSH key exists, you will have the option to overwrite it or skip the key generation. When your SSH key
is copied to the NUC, it will copy the default key, `${HOME}/.ssh/id_rsa.pub`.

## Install Kubernetes Engine on Target

This step does more than just install the Kubernetes engine. It performs the following tasks:

- Updates and upgrades all the packages installed on the target;
- Sets up the WiFi interface as a WiFi Access Point;
- Configures the network interfaces;
- Installs `containerd` for managing containers;
- Installs `k3s` Kubernetes engine; and
- Sets up a local configuration file for `kubectl` to access the cluster.

If using the Docker image, [open the Docker image terminal](#open-docker-image-terminal) and run:

```console
cd ~/ansible
ansible-playbook -i hosts.yml playbook_nuc_setup.yml --limit <target> -u <target_user> -K -e link_kubeconfig=true
```

If using local tools, open a terminal window and run:

```console
cd <COMBINE>/deploy/ansible
ansible-playbook -i hosts.yml playbook_nuc_setup.yml --limit <target> -u <target_user> -K
```

The values for `<target>` and `<target_user>` are specified in [Setup Values](#setup-values) above.

## Setup Kubectl and Environment

### Setup Kubectl

If you do not have a `kubectl` configuration file for the target system, you need to install it. For the NUCs, it is
setup automatically by the Ansible playbook run in the previous section.

For the Production or QA server,

1. Login to the Rancher Dashboard for the Production (or QA) server. You need to have an account on the server that was
   created by the operations group.
2. Copy your `kubectl` configuration to the clipboard and paste it into a file on your host machine, e.g.
   `${HOME}/.kube/prod/config` for the production server.
3. Check that the PVCs are annotated and labeled:
   - Get the full list of `<pvc>`s with `kubectl [--context <context>] -n thecombine get pvc`
   - Check the content of a `<pvc>` with `kubectl [--context <context>] -n thecombine get pvc <pvc> -o yaml`
   - For all of them, make sure that `metadata:` includes the following lines:
     ```
       annotations:
         meta.helm.sh/release-name: thecombine
         meta.helm.sh/release-namespace: thecombine
     ```
     and
     ```
       labels:
         app.kubernetes.io/managed-by: Helm
     ```
   - You can edit a `<pvc>` with `kubectl [--context <context>] -n thecombine edit pvc <pvc>`

### Setup Environment

The setup scripts require the following environment variables to be set:

- AWS_ACCOUNT
- AWS_DEFAULT_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- COMBINE_JWT_SECRET_KEY
- COMBINE_ADMIN_USERNAME
- COMBINE_ADMIN_PASSWORD
- COMBINE_ADMIN_EMAIL

The following environment variables are also required for online deployments (QA/Production), but not for offline
deployments (NUC):

- COMBINE_CAPTCHA_SECRET_KEY
- COMBINE_SMTP_USERNAME
- COMBINE_SMTP_PASSWORD
- HONEYCOMB_API_KEY

You may also set the KUBECONFIG environment variable to the location of the `kubectl` configuration file. This is not
necessary if the configuration file is at `${HOME}/.kube/config`.

If using local tools, these can be set in your `.profile` (Linux or Mac 10.14-), your `.zprofile` (Mac 10.15+), or the
_System_ app (Windows).

If using the Docker image,

1. [Open the Docker image terminal](#open-docker-image-terminal) and run:

   ```console
   nano ~/.env
   ```

2. In the nano editor, enter the environment variable definitions using the form:

   ```config
   export VARIABLE=VALUE
   ```

   If you need the environment variable values, send a request explaining your need to
   [admin@thecombine.app](mailto:admin@thecombine.app).

3. Enter `Ctrl-X` to exit and save the changes.
4. Apply the definitions to the current session by running:

   ```console
   . ~/.env
   ```

   Now the environment variables will be set whenever the [Docker image is started](#open-docker-image-terminal).

## Install Helm Charts Required by _The Combine_

This step sets up the NGINX Ingress Controller, the Certificate Manager ([cert-manager.io](https://cert-manager.io/)),
and the OpenTelemetry analytics collector.

If using the Docker image, [open the Docker image terminal](#open-docker-image-terminal) and run:

```console
python3 ~/scripts/setup_cluster.py
```

If using local tools, open a terminal window and run:

```console
cd <COMBINE>/deploy/scripts
./setup_cluster.py
```

Note: This script is not used for the QA/Production deployments. If you need to do a completely fresh install for either
of those, you can see all the cluster setup steps by executing `setup_cluster.py` with
`--type development --debug 2> setup_cluster.log`.

## Install _The Combine_

This step installs _The Combine_ application itself.

If using the Docker image, [open the Docker image terminal](#open-docker-image-terminal) and run:

```bash
python3 ~/scripts/setup_combine.py --tag <release> --repo public.ecr.aws/thecombine --target <target>
```

If using local tools, open a terminal window and run:

```console
cd <COMBINE>/deploy/scripts
./setup_combine.py --tag <release> --repo public.ecr.aws/thecombine --target <target>
```

`<release>` is the GitHub tag (starting with 'v') for the release to be installed. This is required, since the default
`--tag` value (`latest`) only works in the _Development Environment_. You can see the version of the latest release on
GitHub (<https://github.com/sillsdev/TheCombine>): ![alt text](images/releases.png "The Combine Releases")

Notes:

- When the `./setup_combine.py` script is used to install _The Combine_ on a NUC, it will install the fonts required for
  Arabic, English, French, Portuguese, and Spanish. If additional fonts will be required, call the `setup_combine.py`
  commands with the `--langs` option. Use the `--help` option to see the argument syntax.
- The database image contains a script that will initialize the `SemanticDomains` and the `SemanticDomainTree`
  collections on _first use_ of the database. The script will not be run automatically when the database is restarted or
  updated. If the Semantic Domain data are updated, for example, adding a new language, then the script needs to be
  rerun manually:

  ```console
  kubectl -n thecombine exec deployment/database -- /docker-entrypoint-initdb.d/update-semantic-domains.sh
  ```

## Maintenance

### Maintenance Scripts for Kubernetes

There are several maintenance scripts that can be run in the kubernetes cluster; they are listed in
[./kubernetes_design/README.md#combine_maint-image](./kubernetes_design/README.md#combine_maint-image).

On the Production server, `combine-backup-job.sh` is being run daily and `get_fonts.py` weekly as Kubernetes CronJobs.

In addition to the daily backup, any of the scripts can be run on-demand using the `kubectl` command as follows:

```bash
kubectl [--kubeconfig=<path-to-kubernetes-file>] [-n thecombine] exec -it deployment/maintenance -- <maintenance script> <script options>
```

Notes:

- The `--kubeconfig` option is not required if

  1.  the `KUBECONFIG` environment variable is set to the path of your kubeconfig file, or

  2.  if your kubeconfig file is located in `${HOME}/.kube/config`.

- You can see the options for a script by running:

  ```bash
  kubectl [--kubeconfig=<path-to-kubernetes-file>] [-n thecombine] exec -it deployment/maintenance -- <maintenance scripts> --help
  ```

  The exception is `combine-backup-job.sh` which does not have any script options.

- The `-n thecombine` option is not required if you set `thecombine` as the default namespace for your kubeconfig file
  by running:

  ```bash
  kubectl config set-context --current --namespace=thecombine
  ```

- The `maintenance/scripts/*.py` scripts begin with `#!/usr/bin/env python3` so that they can be run directly in the
  `maintenance` deployment. If you need to execute one of them in a Python virtual environment `(venv)`, precede the
  script name with `python`.

### Checking Certificate Expiration

The `check_cert.py` will print the expiration timestamp for _The Combine's_ TLS certificate.

If using the Docker image, [open the Docker image terminal](#open-docker-image-terminal) and run:

```console
python3 ~/scripts/check_cert.py -n thecombine
```

If using local tools, open a terminal window and run:

```console
cd <COMBINE>/deploy/scripts
./check_cert.py -n thecombine
```

The `-n thecombine` option may be omitted if the default namespace for the kubeconfig file has been set to `thecombine`
as described in [Maintenance Scripts for Kubernetes](#maintenance-scripts-for-kubernetes).

### Creating your own Configurations

#### Ansible Inventory file

You can create your own inventory file to enable Ansible to install the combine on a target that is not listed in the
`deploy/ansible/hosts.yml` inventory file or if you want to override a variable that is used to configure the target.

To use your own inventory file:

- The inventory filename match the pattern \*.hosts.yml, e.g. dev.hosts.yml, or save it in a directory that is not in
  the combine source tree.
- Use hosts.yml as a model. The host will need to be in the `server`, `qa` or the `nuc` group presently. Machines in the
  `server` group will get a certificate from letsencrypt and must be reachable from the internet. Machines in the `qa`
  group will use a self-signed certificate. Machines in the `nuc` group are expected to have a wifi interface and will
  get a certificate that has been created for them and stored in AWS S3.
- At a minimum, the inventory file must define the `combine_server_name` variable for each host.
- You may add any variables whose default value you want to override.
- To use the custom inventory file, add the following option to the ansible-playbook commands above:
  `-i custom-inventory.yml` where `custom-inventory.yml` is the name of the inventory file that you created.

See the Ansible documentation,
[Build Your Inventory](https://docs.ansible.com/ansible/latest/network/getting_started/first_inventory.html) for more
information on inventory files.

#### Combine Configuration file

The default configuration file for _The Combine_ is stored at `deploy/scripts/setup_files/combine_config.yaml`. You can
use the `--config` option to the `deploy/scripts/setup_combine.py` script to use a different configuration. You can also
add new profile definitions to the `deploy/scripts/setup_files/profiles` directory.
