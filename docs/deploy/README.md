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
    cd src/TheCombine/deploy/vagrant
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
You can also connect using a secure shell client with the same credentials.  The host to use is:

     host: localhost
     port: 2222

#### Using Vagrant
Last of all, you can type
```
    vagrant ssh
```
at the command prompt where you launched the VM.

### Building and Installing TheCombine

To connect to the VM using one of the methods described in [Logging Into the VM](#logging-into-the-vm) and run the following commands from the command prompt:
```
cd src\TheCombine
mkcombine
```
```mkcombine``` build the project and then run the ansible playbook for installing and configuring it.  Before running ```mkcombine``` consider updating your working directory by doing a ```git pull``` or by checking out your working branch.

Once ```mkcombine``` completes, you can test the build by connecting to http://localhost:8088 from your web browser.

*Note: The SSL module has not been setup for the apache server yet.  You will see the login screen but will not be able to proceed from there.*

## Stand Up a New Machine

This section describes how to install Ubuntu Server and TheCombine application on a new PC or virtual machine.

### Install Ubuntu Bionic Server

  1. Download the ISO image for Ubuntu Server from Ubuntu (currently at http://cdimage.ubuntu.com/releases/18.04.2/release/ubuntu-18.04.2-server-amd64.iso)

  1. To install on a PC, copy the .iso file to a bootable USB stick.  See the following tutorials for how to do that on [Ubuntu](https://tutorials.ubuntu.com/tutorial/tutorial-create-a-usb-stick-on-ubuntu) or [Windows](https://tutorials.ubuntu.com/tutorial/tutorial-create-a-usb-stick-on-windows).

  1. If you wish to create a Virtual Machine,
     1. install [VirtualBox](https://www.virtualbox.org/) from Oracle.
     2. open *VirtualBox* and create a new virtual machine.
     3. Start the Virtual Machine.  *VirtualBox* will prompt you to select the .iso file that you downloaded above.

  1. Boot the PC/Virtual Machine from the bootable media and follow the installation instructions.  In particular,
     1. You will want the installer to format the entire (virtual) disk and use LVM (that's the default)

     1. *Make sure that you select the OpenSSH server when prompted to select the software for your server:*
  ![alt text](images/ubuntu-software-selection.png "Ubuntu Server Software Selection")

  1. Once installation is complete, you will need to setup networking for a Virtual Machine.  If you are installing Ubuntu on a PC, you can skip to [Installing the App](#installing-the-app).
     1. Open *VirtualBox*.

     1. Create a virual network interface:

        1. Click on the *File* menu and select *Host Network Manager...*

        1. Click the *Create* button to create a new Host Network Adapter.  If it is the first such adapter created it will have the following attributes:

           | Field         | Value           |
           | ------------- | :-------------: |
           | Name:         | vboxnet0        |
           | Addresses:    | 192.168.56.1/24 |
           | DHCP Enabled: | No              |

        1. *Close* the *Host Network Manager* dialog box.

    1. Select the new VM and click on the *Settings* button;

    1. Click on the Adapter 2 tab and set it up as follows:

           | Field                   | Value             |
           | ----------------------- | :---------------: |
           | Enable Network Adapter: | Checked           |
           | Attached to:            | Host-only Adapter |
           | Name:                   | vboxnet0 (linux)<br>VirtualBox Host-Only Ethernet Adapter (windows)   |

    1. For linux hosts, make sure your account is a member of the vboxusers group.

    1. Start the virtual machine and log in.  Setup the network connection for the second adapter as follows:

       1. Run ```ip address``` to list the available interfaces.  There will be one ethernet interface that is up and has an IP address, e.g. enp0s3.  There will be a second ethernet interface that is down, e.g. enp0s8.  Note the name of this interface.

       1. Edit /etc/netplan/01-netcfg.yaml
          ```sudo nano /etc/netplan/01-netcfg.yaml```

       1. Edit the file so that it contains:
          ```
          # This file describes the network interfaces available on your system
          # For more information, see netplan(5).
          network:
            version: 2
            renderer: networkd
            ethernets:
              enp0s3:
                dhcp4: yes
              enp0s8:
                addresses: [192.168.56.10/24]
                gateway4: 192.168.1.1
                nameservers:
                  addresses: [8.8.8.8,8.8.4.4]
                dhcp4: no
          ```
          ... substituting the names of your adapters, of course.  Also make sure that the address you assign is in the subnet specified by the Host Network Adapter.  Unfortunately, you will have to type it.  You will not be able to cut & paste to the VM.

       1. Run: ```sudo netplan apply```

       1. Add the VM's IP address to the ```/etc/hosts``` file on the host computer *(optional)*:

         ```
         # Virtual Machines
         192.168.56.10	nuc-vm

         ```

    1. Now you can access the virtual machine (e.g. ssh, http,) at ```192.168.56.10```.




### Installing the App

The ```deploy``` folder of TheCombine project is a collection of Ansible playbooks that can be use to configure a new installation of Ubuntu Server.  Each playbook uses a set of Ansible roles to drive the configurations.

A setup script, ```setup-target.sh```, is provided to perform the installation.  Its usage is:
```
./setup-target.sh [options] user@machinename
```

### options:

**```-c or --copyid```** causes the script to use ```ssh-copy-id``` to copy your ssh id to the target machine before running the playbook to setup the machine.  This obviates the need to enter your password every time that you connect to the machine.

**```-h or --help```** print the basic usage message.  The usage message is also printed if the script is run without a user@machine name argument.

**```-i or --install``` only run the tasks for installing TheCombine

**```-t or --test```**  only run the tasks for testing the installation of TheCombine.

*if neither the -i nor the -t options are specified, the install and the test tasks will be run.*

## Roles

If you need to create a playbook to run individual roles, the following roles are available in this project.

  **ansible-depends** - installs the packages required to run subsequent Ansible
  modules

  **apache** - installs the apache2 web server

  **dotnet_core** - installs the ASP.NET Core 2.2 Runtime.  It does *not* install the SDK.

  **headless** - sets configuration options that make sense when the device will be used as a headless node.  It currently updates the ```grub``` configuration so that there is not a 30 second wait during bootup when Ubuntu is installed with the Logical Volume Manager.  This is intended for a Server installation.

  **mongodb** - installs the MongoDB database (from mongodb.org, *not* the Ubuntu package) and installs it as a service

  **nodejs** - installs node.js, npm, and yarn

  **the_combine_app** - installs TheCombine application from the ```build``` directory.  The application must be built first; it is not built by the ansible playbook.

  **wifi_ap** - sets up the wifi interface as a wifi access point (hotspot)
