# Deploy *TheCombine* In Docker Containers

This document describes how to deploy *TheCombine* to a target machine in Docker containers.  This method will replace the initial method of installing *TheCombine* directly on the target machine.

### Conventions

  * most of the commands described in this document are to be run from within the <tt>git</tt> repository for *TheCombine* that has been cloned on the host machine.  This directory shall referred to as \<COMBINE\>.
  * the target machine where *TheCombine* is being installed will be referred to as *\<target\>*
  * the user on the target machine that will be used for installing docker, etc. will be referred to as *\<target_user\>*.  You must be able to login to *\<target\>* as *\<target_user\>* and *\<target_user\>* must have `sudo` privileges.

## Contents
1. [Step-by-step Instructions](#step-by-step-instructions)
   1. [Prepare your host system](#prepare-your-host-system)
      1. [Linux Host](#linux-host)
      2. [Windows Host](#windows-host)
   2. [Installing and Running *TheCombine*](#installing-and-running-thecombine)
      1. [Creating Your Own Inventory File](#creating-your-own-inventory-file)

## Step-by-step Instructions
This section gives you step-by-step instructions for installing *The Combine* on a new NUC/PC with links to more detailed information.

### Prepare your host system
#### Linux Host

Install the following components:
 * Ubuntu 18.04 (Desktop or Server), 64-bit
 * Git
 * [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html#latest-releases-via-apt-ubuntu)
 * clone the project  repo:
   ```
   git clone --recurse-submodules https://github.com/sillsdev/TheCombine
   ```
 * if you do not have an ssh key pair, create one using:
   ```
   ssh-keygen
   ```
 * copy your ssh id to the target system using:
   ```
   ssh-copy-id <target_user>@<target>
   ```

#### Windows host
The scripts for installing TheCombine use *Ansible* to manage an installation of *TheCombine*.  *Ansible* is not available for Windows but will run in the Windows Subsystem for Linux (WSL).  Microsoft has instructions for installing WSL on Windows 10 at [Windows Subsystem for Linux Installation Guide for Windows 10](https://docs.microsoft.com/en-us/windows/wsl/install-win10).  At the end of the instructions there are instructions for installing various Linux images including Ubuntu 18.04.

Once Ubuntu is installed, run the Ubuntu subsystem and follow the instructions for the [Linux Host](#linux-host)

### Installing and Running *TheCombine*

To install *TheCombine* run the following commands:
 * `cd <COMBINE>/docker_deploy`
 * `ansible-playbook playbook_docker.yml --limit <target> -u <target_user> -K`

   Notes:
    - Do not add the `-K` option if you do not need to enter your password to run `sudo` commands
    - The *\<target\>* must be listed in the hosts.yml file (in \<COMBINE\>/docker_deploy).  If it is not, then you need to create your own inventory file (see below).

 * `ansible-playbook playbook_publish.yml --limit <target> -u combine`

 #### Creating Your Own Inventory File

 You can create your own inventory file to enable Ansible to install the combine on a target that is not listed in the hosts.yml inventory file or if you want to override a variable that is used to configure the target.

 To use your own inventory file:
  * have the filename match the pattern *.hosts.yml, e.g. dev.hosts.yml, or save it in a directory that is not in the combine source tree;
  * use hosts.yml as a model.  The host will need to be in the `server` or the `qa` group presently.  Machines in the `qa` group will use a self-signed certificate; machines in the `server` group will get a certificate from letsencrypt and must be reachable from the internet.
  * define the following variables:
     - combine_server_name:
     - config_captcha_required:
     - config_captcha_sitekey:

    config_captcha_required should be "true" or "false" (including the quotes);  if it is "false", config_captcha_sitekey can be an empty string.
  * add any variables whose default value you want to override.  In particular, `combine_source_version` specifies the branch in the git repository to be checked out when the project is deployed.
  * to use the custom inventory file, add the following option to the ansible-playbook commands above: `-i custom-inventory.yml` where `custom-inventory.yml` is the name of the inventory file that you created.

  See the Ansible documentation, [Build Your Inventory](https://docs.ansible.com/ansible/latest/network/getting_started/first_inventory.html) for more information on inventory files.
