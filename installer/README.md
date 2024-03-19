# How to Install _The Combine_

This README describes how to install _The Combine_ Rapid Word Collection tool on a laptop or desktop PC.

## Contents

1. [System Requirements](#system-requirements)
2. [Install _The Combine_](#install-the-combine)
3. [Running _The Combine_](#running-the-combine)
4. [Advanced Installation Options](#advanced-installation-options)

### System Requirements

_The Combine_ can be installed on a PC that meets the following requirements:

- Debian-based Linux Operating system, such as _Ubuntu_ or _Wasta Linux_;
- 6 GB of memory;
- WiFi interface that supports creating a WiFi Hotspot;
- a wired-ethernet connection to the Internet
- User account that can run as `root` with `sudo`.

### Install _The Combine_

1. Plug in the wired ethernet connection to the Internet.
2. Update all of the existing software packages through your OS's _Software Updater_ application or by running:

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

   This step is optional but will make the installation process go more smoothly. Restart the PC if requested.

3. Download the installation script from
   [https://s3.amazonaws.com/software.thecombine.app/combine-installer.run](https://s3.amazonaws.com/software.thecombine.app/combine-installer.run)
4. Open a terminal window (Ctrl-Alt-T) and make the script executable:

   ```console
   cd [path where installer was downloaded]
   chmod +x combine-installer.run
   ```

5. Run the script:

   ```console
   cd [path where installer was downloaded]
   ./combine-installer.run
   ```

   Notes:

   - The installation script requires elevated privileges to run most of its tasks. You may be prompted for your
     password in two ways:

     `[sudo] password for {your username}:`

     or

     `BECOME password:`

   - The first time you run the installation script, it will prompt you for an `AWS_ACCESS_KEY_ID` and an
     `AWS_SECRET_ACCESS_KEY`. To get the values to enter here, send a request to the team at
     [The Combine](https://software.sil.org/thecombine/#contact)
   - When run with no options, ./combine-installer.run will install the current version of _The Combine_.
   - If the previous installation did not run to completion, it will resume where the previous installation left off.

_The Combine_ will not be running when installation is complete.

## Running _The Combine_

### Start _The Combine_

To start _The Combine_, open a terminal window and run:

```console
combinectl start
```

### Connecting to _The Combine_

Once _The Combine_ has been started it will create a WiFi hotspot for users to access _The Combine_ using any WiFi
enabled device with a browser. It can also be accessed using the browser directly on the machine where _The Combine_ is
running.

#### Connecting to the WiFi Hotspot

The wireless network name will be `thecombine_ap`. You can connect your device to this network using the passphrase
`Combine2020`.

If you would like to change the WiFi passphrase, see the options described in [combinectl Tool](#combinectl-tool).

#### Connecting to the App

Open a web browser and navigate to [local.thecombine.app](https://local.thecombine.app).

If your browser tries to do a web search, add the `https://` to the beginning, that is,
[https://local.thecombine.app](https://local.thecombine.app)

### Shutting Down _The Combine_

To shutdown _The Combine_, open a terminal window and run:

```console
combinectl stop
```

### combinectl Tool

Once installation is complete, you can use the `combinectl` command to manage the installation. The `combinectl` command
is entered in a terminal window as `combinectl COMMAND [parameters]` The possible commands are:

| Command | Parameters        | Description                                                                                                                                                                                                                                                                                                                            |
| ------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| help    | N/A               | Print a usage message.                                                                                                                                                                                                                                                                                                                 |
| start   | N/A               | Start the combine services.                                                                                                                                                                                                                                                                                                            |
| stop    | N/A               | Stop the combine services.                                                                                                                                                                                                                                                                                                             |
| status  | N/A               | List the status for the combine services.                                                                                                                                                                                                                                                                                              |
| cert    | N/A               | Print the expiration date for the web certificate.                                                                                                                                                                                                                                                                                     |
| update  | release-number    | Update the version of The Combine to the "release-number" specified. You can see the number of the latest release at [The Combine on GitHub](https://github.com/sillsdev/TheCombine/releases). Note that not all releases can be updated this way. If The Combine does not run properly, download and run the updated install package. |
| wifi    | [wifi-passphrase] | If no wifi-passphrase is provieded, the current wifi passphrase is printed. If a new passphase is provided, the wifi passphrase is updated to the new phrase. If your passphrase has spaces or special characters, it is best to enclose your pass phrase in quotation marks ("").                                                     |

If the command is omitted or unrecognized, the help message is printed.

### Maintaining _The Combine's_ Web Interface

_The Combine_ requires a web site certificate to be able to provide a secure connection between _The Combine_ and the
web browsers used to enter and cleanup the data. Having a secure connection prevents the browsers from asking the users
to override their security settings.

_The Combine_ refreshes its certificate when it is connected to the Internet via a wired Ethernet connection. A
certificate will be valid for a time between 60 and 90 days. You can use `combinectl` to view when your current
certificate will expire, for example:

```console

```

## Advanced Installation Options

To run `combine-installer.run` with options, the option list must be started with `--`.

`combine-installer.run` supports the following options:

| option         | description                                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| clean          | Remove the previously saved environment (AWS Access Key, admin user info) before performing the installation.                                                            |
| restart        | Run the installation from the beginning; do not resume a previous installation.                                                                                          |
| uninstall      | Remove software installed by this script.                                                                                                                                |
| update         | Update _The Combine_ to the version number provided. This skips installing the support software that was installed previously.                                           |
| version-number | Specify a version to install instead of the current version. A version number will have the form `vn.n.n` where `n` represents an integer value, for example, `v1.20.0`. |

### Examples

| Command                                    | Effect                                                       |
| ------------------------------------------ | ------------------------------------------------------------ |
| `./combine-installer.run -- v1.16.0`       | Install version `v1.16.0` of _The Combine_.                  |
| `./combine-installer.run -- update v2.1.0` | Update an existing Combine installation to version `v2.1.0`  |
| `./combine-installer.run -- restart`       | Restart the current installation process from the beginning. |
