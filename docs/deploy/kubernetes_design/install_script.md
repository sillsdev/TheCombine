# Installation Script for The Combine on Kubernetes

_The Combine_ can be install on an existing Kubernetes cluster by running the script `./scripts/kubernetes_setup.py`.
The script must be run using the Python virtual environment.

## Requirements

### Kubernetes Cluster

The installation script requires an existing Kubernetes cluster. The method for setting up the Kubernetes cluster varies
by target.

#### Remote Servers

The Production, or Live, server and the QA server are maintained by SIL's LTOps group. Kubernetes is setup and
maintained by this group.

In order to run the installation script for any of the remote servers, you need have:

- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) installed; and
- a `kubeconfig` file for the server to be updated. The `kubeconfig` file is provided by LTOps.

#### NUC

The NUCs run `k3s`, a lightweight Kubernetes implementation by _Rancher_. `k3s` and the required software are installed
on the NUCs by running:

```bash
cd deploy
ansible-playbook playbook_kube_install.yml --limit nuc1 -K
```

(Note that `nuc1` may be replaced with the name of any other NUC in the `hosts.yml` file.)

#### Development machine

Install a Kubernetes cluster on your development system as follows:

##### Windows or MacOS

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Enable Kubernetes:
  - Run Docker Desktop
  - Open the Settings dialog
  - Check "Enable Kubernetes"
  - Click "Apply & Restart"

##### Linux

Install `k3s` and `kubectl` on your development system by running:

```bash
cd deploy
ansible-playbook playbook_kube_install.yml --limit localhost -K
```

## Installing the Combine

### Notes

- Need to manage mulitple configuration files:
  - secret/public
  - groups: nuc/server/qa/development
  - Look at loading a YAML file as a Dict and using our existing YAML files
  - Keep secrets as YAML files but put them in ${HOME}/.combine
