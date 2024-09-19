# Managing Deployments

Author: Jim Grady Date: 11 Sep 2024

## Introduction

This document describes how to manage deploying _The Combine_ on different SIL Kubernetes Clusters as well as in
development and testing environments. The scripts and aliases were developed for the author's use on a Linux system.
They will most likely need to be adapted for other operating systems. Each shows a long-hand method for the same task
when available.

## Terms

The following terms and abbreviations are used in this document.

| Term    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AWS     | Amazon Web Services                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| AWS ECR | Amazon Web Services Elastic Container Registry. AWS ECR stores the Combine's container image repositories. There are public and private repositories. The public repository is for Combine releases; the private repository is for unreleased images, such as each build for the QA machine. One must login to AWS ECR to be able to post images. Login is also required to fetch images from the private repository. Login credentials are only valid for 12 hours. |
| AWS S3  | Amazon Web Services Simple Storage Service. The Combine uses AWS S3 to store daily backups of the Combine database and backend files for the production server. AWS S3 is also used to store the TLS certificates for the NUCs and for the local laptop installations.                                                                                                                                                                                               |

## Getting Started

### Setup AWS Tools

_The Combine_ uses AWS for storing container images, device certificates, backups, etc. There are muliple users that
need to be managed for the different tasks, for example, the `build` user can push container images to AWS ECR; the
general `combine` user cannot.

Follow these steps to setup your environment for using AWS:

1. Install the AWS Client, version 2 from
   [Install or update to the latest version of the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html);
2. Setup your profile YAML file. You should receive the current `aws_profiles.yaml` from a team member:

   1. Create the `${HOME}/.aws` directory if does not exist. The permissions should be read/write/execute for owner
      only:

      ```console
      mkdir -p -m 700 ${HOME}/.aws
      ```

   2. Store the `aws_profiles.yaml` file in `${HOME}/.aws`.
   3. Verify that the `aws_profiles.yaml` file permissions are 400:

      ```console
      $ ls -l ~/.aws/aws_profiles.yaml
      -rw------- 1 me me 1627 Dec 11  2023 /home/me/.aws/aws_profiles.yaml
      ```

   4. Use `set-aws` to create the `${HOME}/.aws/config` and `${HOME}/.aws/credentials` files used by the AWS CLI:

      ```console
      . set-aws <profile-name>
      ```

      or

      ```console
      create_aws_config.py <profile-name>
      . ${HOME}/.aws/env
      ```

      In each case, `<profile-name>` is the name of a profile defined in the `aws_profiles.yaml` file.

**Note:** The information in `${HOME}/.aws` files is sensitive. It is a best practice to store this directory in an
encrypted volume. If your home partition is not encrypted, you can use
[LUKS](https://linuxconfig.org/basic-guide-to-encrypting-linux-partitions-with-luks) to create an encrypted partition
and make `${HOME}/.aws` a symbolic link to a folder in the encrypted partition.

If an existing `aws_profiles.yaml` is not available, there is an example profile YAML file is in
`./configuration_files/aws_profiles.yaml`. The access key ids and access secret keys are setup in AWS IAM.

### Setup Kubernetes Tools

In order to manage the various Kubernetes clusters, you will need a container engine and a Kubernetes configuration file
to specify the location and access credentials that you have for each of the clusters you are managing.

#### Installing a Container Engine

_The Combine_ project
[README.md](https://github.com/sillsdev/TheCombine?tab=readme-ov-file#setup-local-kubernetes-cluster) document describes
how to install the `Rancher Desktop` environment or the `Docker Desktop` environment. One could also install the Docker
Engine by itself; the instructions are at <https://docs.docker.com/engine/install/ubuntu/>.

_Rancher Desktop_ is recommended. It

- supports the latest LTS version of Ubuntu (24.04.1) but _Docker Desktop_ does not;
- its UI, the cluster dashboard, is very helpful and matches the UI for managing the QA and Production servers;
- _Rancher Desktop_ installation includes the `kubectl` and `helm` tools that will be used to manage the clusters

#### Creating the Kubernetes Config File

To access and manage a kubernetes cluster, you need a `kubeconfig` file that defines the location of the cluster(s) and
your access credentials. A `kubeconfig` file contains the following:

- a list of clusters; each cluster has a name, server location, and certificate authority data (optional)
- a list of users; each user has a name, and a token or client certificate data
- a list of contexts; each context has a name, user, cluster, and a default namespace, there may be multiple contexts
  defined for any cluster.

Since a `kubeconfig` file can have multiple contexts, it will also have a `current_context` value.

Since the `kubeconfig` file can support multiple clusters, users, and contexts you can have all of your access
credentials in a single `kubeconfig` file. Alternatively, you can have multiple `kubeconfig` files; for example, one per
cluster.

#### Using Multiple `kubeconfig` Files

If you want to use a separate config file for each cluster, you can specify which file to use by:

- specifying it on the command line, e.g. `kubectl --kubeconfig <<location of kubeconfig file>>`
- setting the `KUBECONFIG` environment variable: `export KUBECONFIG=<<location of kubeconfig file>>`
- you can also set the `KUBECONFIG` environment variable to a list of files, e.g.:
  `export KUBECONFIG=kubeconfig1:kubeconfig2` Note that the list is colon delimited for Linux and Mac and semi-colon
  delimited for Windows.
- if neither the `--kubeconfig` option nor the `KUBECONFIG` environment variable is set, then the file at
  `${HOME}/.kube/config` will be used.

When you set the `KUBECONFIG` environment variable to a list of files, the configurations are effectively merged for
you. This is very helpful because it is easy to update a single configuration. I have found that there are issues with
this method when using desktop environments for the developer testing clusters. For example, when _Rancher Desktop_
starts, it will update the config file to add the `rancher-desktop` context. This makes keeping your clusters in
separate files difficult and one can lose the `rancher-desktop` credentials when one of the files in the list is
updated. For this reason, I prefer to use a single `kubeconfig` file.

#### Using a Single `kubeconfig` File

My preferred method is to download the kubeconfig file for each cluster into a separate file. The file is stored in
`${HOME}/.kube/<<cluster-name>>/config`. The config files are then merged into a single configuration file that is
stored in `${HOME}/.kube/config`. The `kube-merge` bash script below is used to merge the files. The only downside to
this method is when `k3s` is reinstalled on `nuc1`, for example, the file at `${HOME}/.kube/nuc1/config` is overwritten
with new credentials. Re-running `kube-merge nuc1` will merge the updated config file into your `${HOME}/.kube/config`.

### Getting Access to The Combine Kubernetes Clusters

- QA
- Production
- NUCs
- Standalone Laptop
- Development cluster on `localhost`

For the QA and Production server, you can log in to the Rancher UI and download the `kubeconfig` file. Once you have
done this, you can use `kubectl`, `helm` or other tools and scripts to query and update the cluster. See below for the
steps to download the `kubeconfig` file for each cluster you will manage.

The install process for the NUCs will create the `kubeconfig` file during the installation process. The install process
of _Rancher Desktop_ and _Docker Desktop_ will create their own `kubeconfig` files.

### Managing Multiple Kubernetes Clusters

When you need to work with mulitple clusters, you may need to specify a Kubernetes configuration file that is not the
default or you may need to specify a context that is not the current context in the selected configuration file.

The configuration file can be set on the command line or by setting the `KUBECONFIG` environment variable.

A context can be specified on the command line.

Run `kubectl options` or `helm --help` to see the command line options.

Note that the current Python scripts for setting up _The Combine_ or for installing the cluster middleware will check to
see if there are multiple contexts defined in the configuration file. If there are, you will be asked to select the
context to be used for the operation.

### Creating Container Images in AWS ECR

To build the Docker images for _The Combine_ and push them to AWS Elastic Container Registry (ECR), you need to do the
following:

1. Setup to use an AWS profile that has write permission to the AWS ECR:

   ```console
   . set-aws build
   ```

2. Login to AWS ECR

   For the private registry, run:

   ```console
   aws-login
   ```

   For the public registry, run:

   ```console
   aws-pub-login
   ```

3. Run the build script specifying which container registry is to be used with the `--repo` option:

   For the private registry, run:

   ```console
   . venv/bin/activate
   cd deploy/scripts
   ./build.py --tag "v1.2.3-mybranch.1" --repo $AWS_ECR
   ```

   For the public registry, run:

   ```console
   . venv/bin/activate
   cd deploy/scripts
   ./build.py --tag "v1.2.3" --repo $AWS_ECR_PUB
   ```

Note that the $AWS_ECR and $AWS_ECR_PUB are convenience environment variables that are set by the `set-aws` script
above.

## Useful Scripts and Aliases

### Scripts

- `kube-merge <subdir>`

  merge `${HOME}/.kube/<subdir>/config` into `${HOME}/.kube/config`

- `kubesh <deployment>`

  open a bash shell in the specified `<deployment>`. Assumes the deployment is in the current namespace. See `kubens`

- `new-venv`

  Rebuild the Python virtual environment from scratch

- `print-secret.py <secret-resource>`

  Print the decoded contents of the `<secret-resource>`.

- `publish-installer <release>`

  Build the standalone installer, the installer readme file, and push them to AWS S3. Note that the current AWS profile
  must have write permission to s3://software.thecombine.app.

- `set-aws [profile]`

  If `profile` is not specified, `set-aws` will list the available profiles and indicate which is the current profile.
  If `profile` is specified, then the current profile is set to the requested profile. Note that since `set-aws` sets
  environment variables, it must be run with `.` or `source` to have any effect, e.g. `. set-aws build` `set-aws` uses
  the `.aws/aws_profiles.yaml` configuation file and uses the `create_aws_config.py` script to generate the
  `~/.aws/config` and `~/.aws/credentials` files used by the aws cli v2.

- `update-python-deps`

  Recompile & upgrade `dev-requirements.txt`, `deploy/requirements.txt` and `maintenance/requirements.txt` from their
  respective `.in` files.

- `update-venv`

  Synchronize the Python virtual environment with an updated `dev-requirements.txt` file.

### Aliases

The following aliases are defined in the `bin/bash_aliases` file. Merge this file with your current
`${HOME}/.bash_aliases` file.

- `appver`

  Run `app_release.py` to set an `APP_VER` environment variable that can be used as the `--tag` argument for the
  `build.py` and `setup_combine.py` scripts.

- `aws-login`

  Login to the AWS ECR private registry. You may need to first setup a Docker credential helper. See
  [pass](https://docs.docker.com/desktop/get-started/) to setup `pass` for Linux.

- `aws-pub-login`

  Similar to `aws-login` except that you are signed into the AWS ECR Public registry for _The Combine_.

- `kubecontext`

  Print the current Kubernetes contexts with an indication of which is the current context.

- `kubedb`

  Run the `mongosh` against the `CombineDatabase` in the `database` deployment. This alias assumes the default namespace
  for the current context is `thecombine`.

- `kubens <ns>`

  Set the default namespace for the current context to `<ns>`.

- `kubeuse <context>`

  Set the current context to `<context>`

## AWS Management

### AWS CLI v2

### Accounts

### Security Groups

### ECR Login Requirements
