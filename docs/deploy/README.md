# How To Deploy TheCombine Application

This document describes how to build and deploy _TheCombine_ project. It is designed to run on an Intel NUC, for use in
the field, or on the demonstration server, thecombine.languagetechnology.org.

### Intended Audience

These instructions are for developers that have login access to thecombine.languagetechnology.org and have <tt>sudo</tt>
priveleges there.

### Conventions

- most of the commands described in this document are to be run from within the <tt>git</tt> repository for _TheCombine_
  that has been cloned on the host machine. This directory shall referred to as <tt>\${COMBINE}</tt>.

## Contents

1.  [Step-by-step Instructions](#step-by-step-instructions)
    1. [Prepare your host system](#prepare-your-host-system)
       1. [Linux Host](#linux-host)
       2. [Windows Host](#windows-host)
       3. [Create SSH config](#create-ssh-config)
    2. [Installing _TheCombine_](#installing-thecombine)
    3. [Running _TheCombine_](#running-thecombine)
    4. [Updating _TheCombine_](#updating-thecombine)
2.  [Additional Details](#additional-details)
    1. [Install Ubuntu Server](#install-ubuntu-bionic-server)
    2. [Setup NUC Options](#setup-nuc-options)
    3. [Demo Server](#demo-server)

## Step-by-step Instructions

This section gives you step-by-step instructions for installing _The Combine_ on a new NUC/PC with links to more
detailed information.

### Prepare your host system

#### Linux Host

Install the following components:

- Ubuntu 18.04 Desktop, 64-bit
- Git
- [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html#latest-releases-via-apt-ubuntu)
- [Nodejs](https://github.com/nodesource/distributions/blob/master/README.md#debinstall), install the LTS version, 12.x.
- [.NET Core 3.1 SDK](https://dotnet.microsoft.com/download/linux-package-manager/ubuntu18-04) Be sure to select _Ubuntu
  18.04 - x64_ from the dropdown menu on the page.
- clone the project repo:
  ```
  git clone --recurse-submodules https://github.com/sillsdev/TheCombine
  ```

#### Windows host

The scripts for installing TheCombine use _Ansible_ to manage an installation of _TheCombine_. _Ansible_ is not
available for Windows. There is a _Vagrant_ vm that is available to provide an Ubuntu environment to build and install
the application on an _Intel NUC_ that can be deployed in the field. If you only have access to a Windows PC, follow
these instructions to build and deploy _TheCombine_.

- Install [VirtualBox](https://www.virtualbox.org/wiki/Downloads).
- Install [Vagrant](https://www.vagrantup.com/downloads.html). Note that if you are installing Vagrant on an Ubuntu
  host, you should select the Debian package rather than the generic Linux package.
- Clone the project repo:
  ```
  git clone --recurse-submodules https://github.com/sillsdev/TheCombine
  ```
- open a command prompt and change directory to deploy/vagrant-installer sub-folder of the cloned project directory:
  ```
    cd ${COMBINE}/deploy/vagrant-installer
  ```
- create and provision the VM:
  ```
    vagrant up
  ```
- Once the vm is created, the Ubuntu login screen will be displayed. Log in with the following credentials:
  ```
     Username: vagrant
     Password: vagrant
  ```
- Open a terminal window (_Ctrl-Alt-T_). This terminal window may be used to run the commands in the
  [Installing _TheCombine_](#installing-thecombine) section.

Note that _TheCombine_ project is only cloned the first time the vm is created and provisioned. If you have created a
vagrant-installer vm in the past, use <tt>git pull</tt> to update your repo and install the updated software on a
target.

#### Create SSH config

In order to run the playbook that registers the NUC on the certificate server (or "demo server") you need to be able to
<tt>ssh</tt> to the certificate server from your host machine (or from the VM if you are running Windows on your host
machine).

Create an SSH config file (<tt>~/.ssh/config</tt>) to enable an <tt>ssh</tt> connection to the demo server. The SSH
config file shall contain the following configuration:

```
    Host thecombine
    HostName <ip_address_for_thecombine.languagetechnology.org>
    User <demo_server_login>
    IdentityFile ~/.ssh/id_rsa

```

Notes

- the IP address for thecombine.languagetechnology.org is the actual IP address, not the one published by CloudFlare.
- the demo_server_login account must have <tt>sudo</tt> priveleges on thecombine.languagetechnology.org.

### Installing _TheCombine_

These instructions are for installing _TheCombine_ on a blank device. See [Updating _TheCombine_](#updating-thecombine)
for instructions on updating the application on an existing installation.

| Step                                                                                                                                                                      | Comments                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Install Ubuntu Server 18.04; the machinename should be of the form thecombineN where 'N' is a number between 1 and 100.                                                | See [Install Ubuntu Server](#install-ubuntu-bionic-server) for more details                                                                                                                                                                                                                           |
| 2. cd to <tt>\${COMBINE}/deploy</tt> on the host system                                                                                                                   |                                                                                                                                                                                                                                                                                                       |
| 3. ping the fully-qualified domain name of the new system (thecombineN.languagetechnolgy.org). If the machine cannot be reached, add it to your <tt>/etc/hosts</tt> file. |                                                                                                                                                                                                                                                                                                       |
| 4. Run `./setup-nuc.sh --copyid user@machine`                                                                                                                             | <p>where <tt>user</tt> is your login on the NUC and <tt>machine</tt> is the machinename of the NUC that is in <tt>\${COMBINE}/deploy/hosts</tt>.</p><p> The <tt>BECOME password</tt> is your login password for the NUC.</p><p>See [Setup NUC Options](#setup-nuc-options) for additional options</p> |
| 5. Run `./build.sh`                                                                                                                                                       | builds _TheCombine_ frontend and backend applications                                                                                                                                                                                                                                                 |
| 6. run `ansible-playbook playbook_publish.yml --limit <machine> -u <user> -K --ask-vault-pass`                                                                            | <p>Installs _TheCombine_ on the NUC. <tt>machine</tt> and <tt>user</tt> are the same as for the <tt>setup-nuc.sh</tt> script.</p><p>See [Vault Password](#vault-password) for information on the vault password</p>                                                                                   |

### Running _TheCombine_

To run _TheCombine_ on the NUC, connect to the WiFi access point created by the server; the access point SSID is
_nuc_hostname_<tt>\_ap</tt>.

Once you have connected to the WiFi Access Point, connect to the local instance of _TheCombine_ by navigating to
https://thecombine.languagetechnology.org with your web browser.

### Updating _TheCombine_

Once _TheCombine_ has been installed on the NUC, you can update the application by running steps 5 - 8 in the section
[Installing _TheCombine_](#installing-thecombine).

# Additional Details

## Install Ubuntu Bionic Server

1. Download the ISO image for Ubuntu Server from Ubuntu (currently at
   http://cdimage.ubuntu.com/releases/18.04.3/release/ubuntu-18.04.3-server-amd64.iso)

1. copy the .iso file to a bootable USB stick:

   1. Ubuntu host: Use the _Startup Disk Creator_, or
   2. Windows host: follow the
      [tutorial](https://ubuntu.com/tutorials/tutorial-create-a-usb-stick-on-windows#1-overview) on ubuntu.com.

1. Boot the PC from the bootable media and follow the installation instructions. In particular,

   1. You will want the installer to format the entire \[virtual\] disk. Using LVM is not recommended.

   1. _Make sure that you select the OpenSSH server when prompted to select the software for your server:_
      ![alt text](images/ubuntu-software-selection.png "Ubuntu Server Software Selection")

## Vault Password

The Ansible playbooks require that some of the variable files are encrypted. When running one of the playbooks, you will
need to provide the password for the encrypted files. The password can be provided by:

1. entering the password when prompted. Add the <tt>--ask-vault-pass</tt> option for <tt>ansible-playbook</tt> to be
   prompted for the password when it is required. This is the default for <tt>./setup-nuc.sh</tt>
2. specify a file that has the password. Add the <tt>--vault-password-file</tt> option for <tt>ansible-playbook</tt>
   followed by the path of a file that holds the vault password.
3. set the environment variable <tt>ANSIBLE*VAULT_PASSWORD_FILE</tt> to the path of a file that holds the vault
   password. This prevents you from needing to provide the vault password whenever you run an ansible playbook, either
   directly or from within a script such as <tt>setup-nuc.sh</tt>. \_Make sure that you are the only one with read
   permission for the password file!*

If you use a file to hold the vault password, then:

- _Make sure that you are the only one with read permission for the password file!_
- _Make sure that the password file is not tracked in the git repository!_ <p>For example, use hidden file in your home
  directory, such as <tt>\$HOME/.ansible-vault</tt>, with mode of <tt>0600</tt>.</p>

## Setup NUC Options

There are some additional options for using the <tt>setup-nuc.sh</tt> script and the <tt>playbook_publish.yml</tt>
playbook.

1. <tt>setup-nuc.sh</tt> recognizes the following options:
   - <tt>--copyid</tt> copies your ssh public key to the NUC
   - <tt>--vault</tt> or <tt>--vault-password-file</tt> allows you to specify the name of a file that holds the Ansible
     vault password as the next argumnt.
   - <tt>-h</tt> or <tt>--help</tt> prints the usage text and exits
1. Any options that are not recognized by <tt>setup-nuc.sh</tt> are passed to the ansible playbooks that are called by
   <tt>setup-nuc.sh</tt>. This is especially useful for specifying an alternate inventory file for development or
   testing purposes. Note that files whose names end in <tt>".hosts"</tt> are ignored by git.

## Demo Server

The Demo Server has two purposes:

1. it makes _TheCombine_ available on the internet for demonstrations; and
2. it creates and renews the SSL certificate for the demo server and all NUCs.

In order to setup the Demo Server,

- create an SSH config file - see [Create SSH Config](#create-ssh-config)
- run the following commands from the directory for _TheCombine_ repo:
  ```
  cd deploy
  mkdir roles_galaxy
  ansible-galaxy install -r requirements.yml -p roles_galaxy
  ansible-playbook playbook_server.yml -K
  certbot certonly --webroot --force-renewal
  ansible-playbook playbook_publish.yml -K --limit thecombine --ask-vault-pass
  ```
  Notes:
  - <tt>playbook*server.yml</tt> only needs to be run once. In order to update to a newer version of \_TheCombine*, only
    the <tt>playbook_publish.yml</tt> needs to be run.
  - <tt>playbook_server.yml</tt> currently uses the geerlingguy.certbot role to create the letsencrypt SSL certificate.
    This role only supports the <tt>standalone</tt> challenge method. Run the specified <tt>certbot</tt> command to
    convert the renewal to use webroot. The <tt>standalone</tt> certificate requires shutting down the Apache web server
    to renew the certificate and then restarting it.
