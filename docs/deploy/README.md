# How To Deploy TheCombine Application

This document describes how to install a build from *TheCombine* project for
development work or for production use.  There are two methods described below.
The first method, [Vagrant VM Setup](#vagrant-vm-setup), is the simplest method
and is appropriate for testing the application in an environment that matches the
production systems.

The second method, [Stand Up a New Machine](#stand-up-a-new-machine), describes
how to install Ubuntu 18.04 Server on a new PC or virtual machine and then run
the Ansible playbooks to install and configure *TheCombine* and its dependencies.
Setting up a virtual machine has some additional steps that are required in order
to connect to it over the network.

## Vagrant VM Setup

The simplest way to test *TheCombine* application in an environment that mimics the production environment is to use a *Vagrant* virtual machine.

### System Requirements

  1. PC with a 64-bit Windows or Linux operating system.
  2. Hardware virtualization enabled
  3. At least 4 GB RAM

### Installing the Environment

  1. Install [VirtualBox](https://www.virtualbox.org/wiki/Downloads).
  2. Install [Vagrant](https://www.vagrantup.com/downloads.html).  Note that if you are installing Vagrant on an Ubuntu host, you should select the Debian package rather than the generic Linux package.
  3. Clone the project repo, https://github.com/sillsdev/TheCombine

### Creating the VM

  1. open a command prompt and change directory to deploy/vagrant sub-folder of the cloned project directory, e.g.
    ```
    cd TheCombine/deploy/vagrant
    ```
  1. create and provision the VM:
    ```
    vagrant up
    ```
    Note that it may take some time for this to complete.  When finished, there will be a window displaying the console of the virtual machine:
    ![alt text](images/vm-console.png "Ubuntu Server Virtual Machine Console")

### Logging Into the VM

#### At the VM Console

By default, when you run ```vagrant up```, VirtualBox will display a window showing the console for the VM.
You can login to the VM at the console window using the following credentials:

     Username: vagrant
     Password: vagrant

#### Using a Secure Shell Client

You can also connect using a secure shell client with the same credentials:
```
  ssh vagrant@10.10.0.2
```

#### Using Vagrant

Last of all, you can type
```
    vagrant ssh
```
at the command prompt where you launched the VM.

### Building and Installing TheCombine

To connect to the VM using one of the methods described in [Logging Into the VM](#logging-into-the-vm) and run the following commands from the command prompt:
```
cd src\TheCombine\deploy
./setup-target.sh -b vagrant@localhost
```
`setup-target.sh` will build the project and then run the ansible playbook for installing and configuring it.

*When* `setup-target.sh` *runs the installation scripts, you will be prompted for the BECOME password.  The BECOME password is* ```vagrant```.  You will also be prompted for the Ansible vault password.  The vault password is posted on the *Rocket.Chat* discussion, `#the-combine`

Before running `setup-target.sh` consider updating your working directory by doing a ```git pull``` or by checking out your working branch.

Once `setup-target.sh` completes, you can test the build by connecting to http://localhost:8088 from your web browser.

## Stand Up a New Machine

This section describes how to install Ubuntu Server and TheCombine application on a new PC.

### Host System Requirements

The following requirements are for the host system that is used to install the Combine application onto a new PC:
  * Ubuntu 18.04 Desktop, 64-bit
  * Git
  * [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html#latest-releases-via-apt-ubuntu)
  * [Nodejs](https://github.com/nodesource/distributions/blob/master/README.md#debinstall), install the LTS version, 10.x.
  * [.NET Core 2.2 SDK](https://dotnet.microsoft.com/download/linux-package-manager/ubuntu18-04/sdk-2.2.300)
  * [MongoDB Community Edition](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
  * clone the project repo to the working folder of your choice, e.g. ```$HOME/src```

### Install Ubuntu Bionic Server

  1. Download the ISO image for Ubuntu Server from Ubuntu (currently at http://cdimage.ubuntu.com/releases/18.04.2/release/ubuntu-18.04.2-server-amd64.iso)

  1. Use the *Startup Disk Creator* to copy the .iso file to a bootable USB stick.

  1. Boot the PC from the bootable media and follow the installation instructions.  In particular,
     1. You will want the installer to format the entire (virtual) disk and use LVM (that's the default)

     1. *Make sure that you select the OpenSSH server when prompted to select the software for your server:*
  ![alt text](images/ubuntu-software-selection.png "Ubuntu Server Software Selection")

### Build the App

To build the Combine application in the Ubuntu Environment, run the following command (assumes the repo was cloned into ```$HOME/src```):
```
cd ~/src/TheCombine
npm install
npm run build
```

### Installing the App

The ```deploy``` folder of TheCombine project is a collection of Ansible playbooks that can be use to configure a new installation of Ubuntu Server.  Each playbook uses a set of Ansible roles to drive the configurations.

A setup script, ```setup-target.sh```, is provided to perform the installation.  Its usage is:
```
./setup-target.sh [options] user@machinename
```

### options:
Usage: ./setup-target.sh [options] user@machinename
 where:
**`-b, --build`** will build/publish the UI and Backend server before deploying The Combine

**```-c or --copyid```** causes the script to use ```ssh-copy-id``` to copy your ssh id to the target machine before running the playbook to setup the machine.  This obviates the need to enter your password every time that you connect to the machine.

**```-h or --help```** print the basic usage message.  The usage message is also printed if the script is run without a user@machine name argument.

**```-i or --install```** only run the tasks for installing TheCombine

**```-t or --test```**  only run the tasks for testing the installation of TheCombine.

*if neither the -i nor the -t options are specified, the install and the test tasks will be run.*

**`-v <vaultpasswordfile>, --vault <vaultpasswordfile>`** use <vaultpasswordfile> for the vault password. If no password file is specified, the user will be prompted for the vault password when it is needed.

## Roles

If you need to create a playbook to run individual roles, the following roles are available in this project.

  **ansible-depends** - installs the packages required to run subsequent Ansible
  modules

  **ssl-config** - creates the SSL certificate for the Apache web server

  **apache-config** - installs and configures the apache2 web server

  **dotnet_core** - installs the ASP.NET Core 2.2 Runtime.  It does *not* install the SDK.

  **headless** - sets configuration options that make sense when the device will be used as a headless node.  It currently updates the ```grub``` configuration so that there is not a 30 second wait during bootup when Ubuntu is installed with the Logical Volume Manager.  This is intended for a Server installation.

  **mongodb** - installs the MongoDB database (from mongodb.org, *not* the Ubuntu package) and installs it as a service

  **nodejs** - installs node.js, npm, and yarn

  **the_combine_app** - installs TheCombine application from the ```build``` directory and the Backend `publish` directory.  The application must be built first; it is not built by the ansible playbook.

  **wifi_ap** - sets up the wifi interface as a wifi access point (hotspot)
