# The Combine

[![Frontend Actions Status][github-actions-frontend-badge]][github-actions-frontend]
[![Frontend Coverage][frontend-codecov-badge]][codecov-frontend]

[![Backend Actions Status][github-actions-backend-badge]][github-actions-backend]
[![Backend Coverage][backend-codecov-badge]][codecov-backend]

[![GitHub release][github-release-badge]][github-version] [![GitHub version][github-version-badge]][github-version]
[![GitHub][github-license-badge]][github-license] [![GitHub contributors][github-contribs-badge]][github-contribs]

[![User Interface][localization-ui-badge]][localization-crowdin-combine]
[![Semantic Domains][localization-sd-badge]][localization-crowdin-flex]
[![User Guide][localization-ug-badge]][localization-crowdin-combine]

[github-actions-frontend-badge]: https://github.com/sillsdev/TheCombine/workflows/frontend/badge.svg
[frontend-codecov-badge]: https://codecov.io/gh/sillsdev/TheCombine/branch/master/graph/badge.svg?flag=frontend
[codecov-frontend]: https://app.codecov.io/gh/sillsdev/TheCombine/tree/master/src
[codecov-backend]: https://app.codecov.io/gh/sillsdev/TheCombine/tree/master/Backend
[github-actions-backend-badge]: https://github.com/sillsdev/TheCombine/workflows/backend/badge.svg
[backend-codecov-badge]: https://codecov.io/gh/sillsdev/TheCombine/branch/master/graph/badge.svg?flag=backend
[localization-ui-badge]: https://img.shields.io/badge/User%20Interface-Ar%20En%20Es%20Fr%20Pt%20Zh-blue
[github-actions-frontend]: https://github.com/sillsdev/TheCombine/actions/workflows/frontend.yml
[github-actions-backend]: https://github.com/sillsdev/TheCombine/actions/workflows/backend.yml
[localization-sd-badge]:
  https://img.shields.io/badge/Semantic%20Domains-Ar%20En%20Es%20Fr%20Hi%20Id%20Ml%20My%20Pt%20Ru%20Sw%20Zh-blue
[localization-ug-badge]: https://img.shields.io/badge/User%20Guide-En%20Es%20Zh-blue
[localization-crowdin-combine]: https://crowdin.com/project/the-combine
[localization-crowdin-flex]: https://crowdin.com/project/fieldworks
[github-version-badge]: https://img.shields.io/github/package-json/v/sillsdev/TheCombine
[github-release-badge]: https://img.shields.io/github/v/release/sillsdev/TheCombine
[github-version]: https://github.com/sillsdev/TheCombine/releases
[github-license-badge]: https://img.shields.io/github/license/sillsdev/TheCombine
[github-license]: https://github.com/sillsdev/TheCombine/blob/master/LICENSE
[github-contribs-badge]: https://img.shields.io/github/contributors/sillsdev/TheCombine?cacheSeconds=10000
[github-contribs]: https://github.com/sillsdev/TheCombine/graphs/contributors

A rapid word collection tool. See the [User Guide](https://sillsdev.github.io/TheCombine) for uses and features.

## Table of Contents

1. [Getting Started with Development](#getting-started-with-development)
   1. [Install Required Software](#install-required-software)
   2. [Prepare The Environment](#prepare-the-environment)
   3. [Python](#python)
      1. [Windows Python Installation](#windows-python-installation)
      2. [Linux Python Installation](#linux-python-installation)
      3. [macOS Python Installation](#macos-python-installation)
      4. [Python Packages](#python-packages)
   4. [Load Semantic Domains](#load-semantic-domains)
2. [Available Scripts](#available-scripts)
   1. [Running in Development](#running-in-development)
   2. [Using OpenAPI](#using-openapi)
   3. [Running the Automated Tests](#running-the-automated-tests)
   4. [Import Semantic Domains](#import-semantic-domains)
   5. [Generate License Reports](#generate-license-reports)
   6. [Inspect Database](#inspect-database)
   7. [Add or Update Dictionary Files](#add-or-update-dictionary-files)
   8. [Cleanup Local Repository](#cleanup-local-repository)
   9. [Generate Installer Script for The Combine](#generate-installer-script-for-the-combine-linux-only)
   10. [Generate Tutorial Video Subtitles](#generate-tutorial-video-subtitles)
3. [Setup Local Kubernetes Cluster](#setup-local-kubernetes-cluster)
   1. [Install Rancher Desktop](#install-rancher-desktop)
   2. [Install Docker Desktop](#install-docker-desktop)
   3. [Install Kubernetes Tools](#install-kubernetes-tools)
4. [Setup _The Combine_](#setup-the-combine)
   1. [Install Required Charts](#install-required-charts)
   2. [Build _The Combine_ Containers](#build-the-combine-containers)
   3. [Setup Environment Variables](#setup-environment-variables)
   4. [Install/Update _The Combine_](#installupdate-the-combine)
   5. [Connecting to your Cluster](#connecting-to-your-cluster)
   6. [Rancher Dashboard](#rancher-dashboard)
5. [Maintenance](#maintenance)
   1. [Development Environment](#development-environment)
   2. [Kubernetes Environment](#kubernetes-environment)
6. [User Guide](#user-guide)
7. [Continuous Integration and Continuous Deployment](#continuous-integration-and-continuous-deployment)
   1. [On Pull Request](#on-pull-request)
   2. [On Release](#on-release)
8. [Production](#production)
9. [Learn More](#learn-more)

## Getting Started with Development

### Install Required Software

1. Clone this repo:

   ```bash
   git clone https://github.com/sillsdev/TheCombine.git
   ```

2. [Chocolatey][chocolatey] (Windows only): a Windows package manager.
3. [Node.js 22 (LTS)](https://nodejs.org/en/download/)

   - On Windows, if using [Chocolatey][chocolatey]: `choco install nodejs-lts`
   - On Ubuntu, follow
     [this guide](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions) using the
     appropriate Node.js version.

4. [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

   - On Ubuntu, if using Snap: `sudo snap install dotnet-sdk --classic --channel 8.0/stable`

5. [MongoDB](https://mongodb.com/docs/manual/administration/install-community/) provides instructions on how to install
   the current release of MongoDB.

   - On Windows, if using [Chocolatey][chocolatey]: `choco install mongodb`

   After installation:

   - Add mongo's `/bin` directory to your PATH environment variable.
   - Disable automatically start of the `mongod` service on your development host.
   - If `mongosh` is not a recognized command, you may have to separately install the
     [MongoDB Shell](https://www.mongodb.com/try/download/shell) and add its `/bin` to your PATH.
   - If `mongoimport` is not a recognized command, you may have to separately install the
     [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools) and add its `/bin` to your PATH.

6. [VS Code](https://code.visualstudio.com/download).
   - When you open this repo folder in VS Code, it should recommend the extensions used in this project (see
     `.vscode/extensions.json`).
7. [Python](#python): The Python section of this document has instructions for installing _Python 3_ on each of the
   supported platforms and how to setup your virtual environment.
8. [FFmpeg](https://www.ffmpeg.org/download.html) and add its `/bin` to your PATH.

   - On Mac:
     - If using [homebrew](https://formulae.brew.sh/formula/ffmpeg): `brew install ffmpeg`
     - If manually installing from the FFmpeg website, install both `ffmpeg` and `ffprobe`

9. [dotnet-reportgenerator](https://github.com/danielpalme/ReportGenerator)
   `dotnet tool update --global dotnet-reportgenerator-globaltool --version 5.0.4`
10. [nuget-license](https://github.com/sensslen/nuget-license) `dotnet tool update --global nuget-license`
11. Tools for generating the self installer (Linux only):

    - [makeself](https://makeself.io/) - a tool to make self-extracting archives in Unix
    - [pandoc](https://pandoc.org/installing.html#linux) - a tool to convert Markdown documents to PDF.
    - `weasyprint` a PDF engine for `pandoc`.

    These can be installed on Debian-based distributions by running:

    ```console
    sudo apt install -y makeself pandoc weasyprint
    ```

### Prepare the Environment

1. _(Optional)_ If you want the email services to work you will need to set the following environment variables. These
   `COMBINE_SMTP_` values must be kept secret, so ask your email administrator to supply them. Set them in your
   `.profile` (Linux or Mac 10.14-), your `.zprofile` (Mac 10.15+), or the _System_ app (Windows).

   - `COMBINE_EMAIL_ENABLED=true`
   - `COMBINE_SMTP_SERVER`
   - `COMBINE_SMTP_PORT`
   - `COMBINE_SMTP_USERNAME`
   - `COMBINE_SMTP_PASSWORD`
   - `COMBINE_SMTP_ADDRESS`
   - `COMBINE_SMTP_FROM`

2. Run `npm start` from the project directory to install dependencies and start the project.

3. Consult our [C#](docs/style_guide/c_sharp_style_guide.md) and [TypeScript](docs/style_guide/ts_style_guide.md) style
   guides for best coding practices in this project.

[chocolatey]: https://chocolatey.org/

### Python

_Python_ (3.12 recommended) is required to run the scripts that are used to initialize and maintain the cluster. Note
that the commands for setting up the virtual environment must be run from the top-level directory for _The Combine_
source tree.

#### Windows Python Installation

- Navigate to the [Python Downloads](https://www.python.org/downloads/) page.

- Select the "Download Python" button at the top of the page. This will download the latest appropriate x86-64
  executable installer.

- Once Python is installed, create an isolated Python [virtual environment](https://docs.python.org/3/library/venv.html)
  using the [`py`](https://docs.python.org/3/using/windows.html#getting-started) launcher installed globally into the
  `PATH`.

  ```bash
  py -m venv venv
  venv\Scripts\activate
  ```

#### Linux Python Installation

The `python3` package is included in the Ubuntu distribution. To install the `pip` and `venv` modules for Python 3, run
the following commands:

```bash
sudo apt update
sudo apt install python3-pip python3-venv
```

Create and activate an isolated Python virtual environment

```bash
python3 -m venv venv
# This command is shell-specific, for the common use case of bash:
source venv/bin/activate
```

#### macOS Python Installation

Install [Homebrew](https://brew.sh/).

Install Python 3 using Homebrew:

```bash
brew install python
```

Create and activate isolated Python virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

#### Python Packages

**Important**: All Python commands and scripts should be executed within a terminal using an activated Python virtual
environment. This will be denoted with the `(venv)` prefix on the prompt.

With an active virtual environment, install Python development requirements for this project:

```bash
python -m pip -q install --upgrade pip pip-tools
python -m piptools sync -q dev-requirements.txt
```

The following Python scripts can now be run from the virtual environment.

To perform automated code formatting of Python code:

```bash
tox -e fmt
```

To run all Python linting steps:

```bash
tox
```

To upgrade all pinned development dependencies:

```bash
python -m piptools compile --upgrade dev-requirements.in
```

To upgrade the pinned dependencies for deployment:

```bash
cd deploy
python -m piptools compile --upgrade requirements.in
```

To upgrade the pinned dependencies for the Maintenance container:

```bash
cd maintenance
python -m piptools compile --upgrade requirements.in
```

### Load Semantic Domains

Data Entry will not work in The Combine unless the semantic domains have been loaded into the database. Follow the
instuctions in [Import Semantic Domains](#import-semantic-domains) below to import the domains from at least one of the
semantic domains XML files (which each contain domain data in English and one other language.)

## Available Scripts

### Running in Development

In the project directory, you can run:

#### `npm start`

> Note: To avoid browser tabs from being opened automatically every time the frontend is launched, set
> [`BROWSER=none`](https://create-react-app.dev/docs/advanced-configuration/) environment variable.

Installs the necessary packages and runs the app in the development mode.

Open <http://localhost:3000> to view it in the browser.

#### `npm run frontend`

Runs only the front end of the app in the development mode.

#### `npm run backend`

Runs only the backend.

#### `npm run database`

Runs only the mongo database.

#### `npm run build`

Builds the app for production to the `build` folder.

It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `npm run analyze`

Run after `npm run build` to analyze the contents build bundle chunks.

### Using OpenAPI

You need to have run `npm start` or `npm run backend` first.

To browse the auto-generated OpenAPI UI, browse to [http://localhost:5000/openapi](http://localhost:5000/openapi).

#### Regenerate OpenAPI bindings for frontend

First, you must install the Java Runtime Environment (JRE) 8 or newer as mentioned in the
[`openapi-generator` README](https://github.com/OpenAPITools/openapi-generator#13---download-jar).

- For Windows: Install [OpenJDK](https://www.microsoft.com/openjdk)
- For Ubuntu: `sudo apt install default-jre`
- For macOS: `brew install adoptopenjdk`

After that, run the following script in your Python virtual environment to regenerate the frontend OpenAPI bindings in
place:

```bash
python scripts/generate_openapi.py
```

### Running the Automated Tests

#### `npm test`

Run all backend and frontend tests.

#### `npm run test-backend`

Run all backend unit tests.

To run a subset of tests, use the
[`--filter`](https://docs.microsoft.com/en-us/dotnet/core/testing/selective-unit-tests?pivots=nunit) option.

```bash
# Note the extra -- needed to separate arguments for npm vs script.
npm run test-backend -- --filter FullyQualifiedName~Backend.Tests.Models.ProjectTests
```

#### `npm run test-frontend`

Launches the test runners in the interactive watch mode. See the section about
[running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

To run a subset of tests, pass in the name of a partial file path to filter:

```bash
# Note the extra -- needed to separate arguments for npm vs script.
npm run test-frontend -- DataEntry
```

#### `npm run test-*:coverage`

Launches the test runners to calculate the test coverage of the frontend or backend of the app.

##### Frontend Code Coverage Report

Run:

```bash
npm run test-frontend:coverage
```

To view the frontend code coverage open `coverage/lcov-report/index.html` in a browser.

##### Backend Code Coverage Report

Run:

```bash
npm run test-backend:coverage
```

Generate the HTML coverage report:

```bash
npm run gen-backend-coverage-report
```

Open `coverage-backend/index.html` in a browser.

#### `npm run test-frontend:debug`

Runs Jest tests for debugging, awaiting for an attach from an IDE.

For VSCode, run the **Debug Jest Tests** configuration within the Run tab on the left taskbar.

#### `npm run fmt-backend`

Automatically format the C# source files in the backend.

#### `npm run lint`

Runs ESLint on the codebase to detect code problems that should be fixed.

### `npm run lint:fix-layout`

Run ESLint and apply `suggestion` and `layout` fixes automatically. This will sort and group imports.

#### `npm run fmt-frontend`

Auto-format frontend code in the `src` folder.

### Import Semantic Domains

To import Semantic Domains from the XML files in `./deploy/scripts/semantic_domains/xml`. Run from within a Python
virtual environment.

1. Generate the files for import into the Mongo database:

   ```bash
   cd ./deploy/scripts
   python sem_dom_import.py <xml_filename> [<xml_filename> ...]
   ```

   where `<xml_filename>` is the name of the file(s) to import. Currently each file contains English and one other
   language. In bash (not powershell), you can import all the xml files at once with:

   ```bash
   cd deploy/scripts && python sem_dom_import.py semantic_domains/xml/*
   ```

2. Start the database:

   ```bash
   npm run database
   ```

3. Import the files that were created.

   There are two files that were created for each language in step 1, a `nodes.json` and a `tree.json`. The `nodes.json`
   file contains the detailed data for each node in the semantic domain tree; the `tree.json` file contains the tree
   structure of the semantic domains. To import the semantic domain data, run:

   ```bash
   cd ./deploy/scripts/semantic_domains/json
   mongoimport -d CombineDatabase -c SemanticDomains nodes.json --mode=upsert --upsertFields=id,lang,guid
   mongoimport -d CombineDatabase -c SemanticDomainTree tree.json --mode=upsert --upsertFields=id,lang,guid
   ```

### Generate License Reports

To generate a summary of licenses used in production

```bash
npm run license-summary-backend
npm run license-summary-frontend
```

To generate a full report of the licenses used in production that is included in the user guide:

```bash
npm run license-report-backend
npm run license-report-frontend
```

> Note: This should be performed each time production dependencies are changed.

### Inspect Database

To browse the database locally during development, open [MongoDB Compass](https://www.mongodb.com/try/download/compass).

1. Under New Connection, enter `mongodb://localhost:27017`
2. Under Databases, select CombineDatabase

### Add or Update Dictionary Files

The dictionary files for spell-check functionality in _The Combine_ are split into parts to allow lazy-loading, for the
sake of devices with limited bandwidth. There are scripts for generating these files in `public/dictionaries/` and
`src/resources/dictionaries/`; files in this directory should _not_ be manually edited.

The bash script `scripts/fetch_wordlists.sh` is used to fetch dictionary files for a given language (e.g., `es`) from
the [LibreOffice dictionaries](https://github.com/LibreOffice/dictionaries) and convert them to raw wordlists (e.g.,
`src/resources/dictionaries/es.txt`). Execute the script with no arguments for its usage details. Any language not
currently supported can be manually added as a case in this script.

```bash
./scripts/fetch_wordlist.sh
```

The python script `scripts/split_dictionary.py` takes a wordlist textfile (e.g., `src/resources/dictionaries/es.txt`),
splits it into multiple text files (e.g., `public/dictionaries/es/u*.dic`), creates a TypeScript file to load them
(e.g., `src/resources/dictionaries/es.ts`), and updates `src/resources/dictionaries/index.ts` accordingly. Run the
script within a Python virtual environment, with `-h`/`--help` to see its usage details.

```bash
python scripts/split_dictionary.py --help
```

For some languages, the wordlist is too large for practical use. Generally try to keep the folder for each language
under 2.5 MB. For smaller folder sizes, default maximum word-lengths are automatically imposed for some languages:
(`ar`, `es`, `fr`, `hi`, `pt`, `ru`). Use `-m`/`--max` to override the defaults, with `-m -1` to force no limit.

Adjust the `-t`/`--threshold` and `-T`/`--Threshold` parameters to split a wordlist into more, smaller files; e.g.:

- `python scripts/split_dictionary.py -l es -T 15000`
- `python scripts/split_dictionary.py -l sw -t 1500`

The top of each language's `.ts` file states which values of `-m`, `-t`, and `-T` were used for that language.

### Cleanup Local Repository

It's sometimes possible for a developer's local temporary state to get out of sync with other developers or CI. This
script removes temporary files and packages while leaving database data intact. This can help troubleshoot certain types
of development setup errors. Run from within a Python virtual environment.

```bash
python scripts/cleanup_local_repo.py
```

### Generate Installer Script for The Combine (Linux only)

To generate the installer script, run the following commands starting in the project top level directory:

```console
cd installer
./make-combine-installer.sh combine-release-number
```

where `combine-release-number` is the Combine release to be installed, e.g. `v2.1.0`.

Options:

- `--net-install` - build an installer that will download the required images at installation time. The default is to
  package the images in the installation script.

To update the PDF copy of the installer README.md file, run the following from the `installer` directory:

```console
pandoc --pdf-engine=weasyprint --metadata title="The Combine Installation Instructions" README.md -o README.pdf
```

## Generate Tutorial Video Subtitles

Tutorial video transcripts are housed in `docs/tutorial_subtitles`, together with timestamps aligning transcripts with
the corresponding videos and any transcript translations downloaded from Crowdin. To generate subtitle files (and
optionally attach them to a video file), run from within a Python virtual environment:

```bash
python scripts/subtitle_tutorial_video.py -s <subtitles_subfolder_name> [-i <input_video_path> -o <output_video_path>] [-v]
```

## Setup Local Kubernetes Cluster

This section describes how to create a local Kubernetes cluster using either _Rancher Desktop_ or _Docker Desktop_.

Advantages of _Rancher Desktop_:

1. runs the same Kubernetes engine, `k3s`, that is used by _The Combine_ when installed on a NUC; and
2. includes the Rancher User Interface for easy inspection and management of Kubernetes resources:

![alt text](docs/images/rancher-desktop-dashboard.png "Rancher Desktop Dashboard")

Advantages of _Docker Desktop_:

1. can run with fewer memory resources; and
2. simpler to navigate to the running application from your web browser.

The steps to install _The Combine_ in a local Kubernetes client are:

1. [Install Rancher Desktop](#install-rancher-desktop) OR [Install Docker Desktop](#install-docker-desktop)
2. [Install Kubernetes Tools](#install-kubernetes-tools)
3. [Setup The Combine](#setup-the-combine)

### Install Rancher Desktop

Install [Rancher Desktop](https://rancherdesktop.io/) to create a local Kubernetes cluster to test _The Combine_ when
running in containers. (_Optional. Only needed for running under Kubernetes._)

When _Rancher Desktop_ is first run, you will be prompted to select a few initial configuration items:

![alt text](docs/images/rancher-desktop-select-runtime.png "Rancher Desktop Select Runtime")

1. Verify that _Enable Kubernetes_ is checked.
2. Select the Kubernetes version marked as _stable, latest_.
3. Select your container runtime, either _containerd_ or _dockerd (moby)_:
   - _containerd_ matches what is used on the NUC and uses the `k3s` Kubernetes engine. It requires that you set the
     `CONTAINER_CLI` environment variable to `nerdctl` before running the `build.py` script.
   - _dockerd_ uses the `k3d` (`k3s` in docker).
4. Select _Automatic_ or _Manual_ path setup.
5. Click _Accept_.

The _Rancher Desktop_ Main Window will be displayed as it loads the Kubernetes environment. While the page is displayed,
click the _Settings_ icon (gear icon in the upper-right corner). The settings dialog will be displayed:
![alt text](docs/images/rancher-desktop-prefs-kube.png "Rancher Desktop Preferences")

1. Click _Kubernetes_ in the left-hand pane.
2. Uncheck the _Enable Traefik_ checkbox.

### Install Docker Desktop

Install _Docker Desktop_ from <https://docs.docker.com/get-docker/>.

Notes for installing _Docker Desktop_ in Linux:

1. On Ubuntu: https://docs.docker.com/desktop/setup/install/linux/ubuntu/#install-docker-desktop
2. If you installed `docker` or `docker-compose` previously, remove them:

   ```bash
   sudo apt purge docker-ce docker-ce-cli containerd.io
   sudo apt autoremove
   if [ -L /usr/bin/docker-compose ] ; then sudo rm /usr/bin/docker-compose ; fi
   if [ -x /usr/local/bin/docker-compose ] ; then sudo rm /usr/local/bin/docker-compose ; fi
   ```

Once _Docker Desktop_ has been installed, start it, and set it up as follows:

1. Click the gear icon in the upper right to open the settings dialog;
2. Click on the _Resources_ link on the left-hand side and set the Memory to at least 6 GB (see Note);
3. Click on the _Kubernetes_ link on the left-hand side;
4. Select _Enable Kubernetes_ and click _Apply & Restart_;
5. Click _Install_ on the dialog that is displayed.

Notes:

- Normally, there is a slider to adjust the Memory size for the _Docker Desktop_ virtual machine. On Windows systems
  using the WSL 2 backend, there are instructions for setting the resources outside of the _Docker Desktop_ application.
- On Linux, it's possible for `docker-desktop` to be run without the GUI, which can prevent the _Docker Desktop_ GUI
  from opening. In that situation, execute `systemctl --user stop docker-desktop`.

### Install Kubernetes Tools

If the following tools were not installed with either _Rancher Desktop_ or _Docker Desktop_, install them from these
links:

1. [kubectl](https://kubernetes.io/docs/tasks/tools/)
   - On Windows, if using [Chocolatey][chocolatey]: `choco install kubernetes-cli`
2. [helm](https://helm.sh/docs/intro/install/)
   - On Windows, if using [Chocolatey][chocolatey]: `choco install kubernetes-helm`

## Setup _The Combine_

This section describes how to build and deploy _The Combine_ to your Kubernetes cluster. Unless specified otherwise, all
of the commands below are run from _The Combine's_ project directory and are run in an activated Python virtual
environment. (See the [Python](#python) section to create the virtual environment.)

### Install Required Charts

Install the required charts by running:

```bash
python deploy/scripts/setup_cluster.py --type development
```

`deploy/scripts/setup_cluster.py` assumes that the `kubectl` configuration file is setup to manage the desired
Kubernetes cluster. For most development users, there will only be the _Rancher Desktop_/_Docker Desktop_ cluster to
manage and the installation process will set that up correctly. If there are multiple clusters to manage, the
`--kubeconfig` and `--context` options will let you specify a different cluster.

Run the script with the `--help` option to see possible options for the script.

### Build _The Combine_ Containers

Build _The Combine_ containers by running the build script in an activated Python virtual environment from
_TheCombine_'s project directory. (See the [Python](#python) section to create the virtual environment.)

```bash
python deploy/scripts/build.py
```

Notes:

- If you are using _Rancher Desktop_ with `containerd` for the container runtime, set the following environment variable
  in your user profile:

  ```bash
  export CONTAINER_CLI="nerdctl"
  ```

  If you are using _Rancher Desktop_ with the `dockerd` container runtime or _Docker Desktop_, clear this variable or
  set its value to `docker`.

- Run with the `--help` option to see all available options.
- If you see errors like:

  ```console
  => ERROR [internal] load metadata for docker.io/library/nginx:1.21        0.5s
  ```

  pull the image directly and re-run the build. In this case, you would run:

  ```console
  docker pull nginx:1.21
  ```

- If `--tag` is not used, the image will be untagged. When running or pulling an image with the tag `latest`, the
  newest, untagged image will be pulled.
- `--repo` and `--tag` are not specified under normal development use.

### Setup Environment Variables

Before installing _The Combine_ in Kubernetes, you need to set the following environment variables:
`COMBINE_CAPTCHA_SECRET_KEY`, `COMBINE_JWT_SECRET_KEY`. For development environments, you can use the values defined in
`Backend/Properties/launchSettings.json`. Set them in your `.profile` (Linux or Mac 10.14-), your `.zprofile` (Mac
10.15+), or the _System_ app (Windows).

_Note: The following is optional for Development Environments._

In addition to the environment variables defined in [Prepare the Environment](#prepare-the-environment), you may setup
the following environment variables:

- `AWS_ACCOUNT`
- `AWS_DEFAULT_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

These variables will allow _The Combine_ to:

- pull released and QA software images from AWS Elastic Container Registry (ECR);
- create backups and push them to AWS S3 storage; and
- restore _The Combine's_ database and backend files from a backup stored in AWS S3 storage.

The Combine application will function in a local cluster without these `AWS_` variables set.

### Install/Update _The Combine_

Install the Kubernetes resources to run _The Combine_ by running:

```bash
python deploy/scripts/setup_combine.py [--target <target_name>] [--tag <image_tag>]
```

Notes:

- The default target is `localhost`; the default tag is `latest`. For development testing the script will usually be run
  with no arguments.

- If an invalid target is entered, the script will list available targets and prompt the user his/her selection.
  `deploy/scripts/setup_combine.py` assumes that the `kubectl` configuration file is setup to manage the desired
  Kubernetes cluster. For most development users, there will only be the _Rancher Desktop/Docker Desktop_ cluster to
  manage and the installation process will set that up correctly. If there are multiple clusters to manage, the
  `--kubeconfig` and `--context` options will let you specify a different cluster.

- Run the script with the `--help` option to see possible options for the script.

- The setup assumes `amd64` architecture. If the target architecture is `arm64`, add `--set global.cpuArch=arm64`.

When the script completes, the resources will be installed on the specified cluster. It may take a few moments before
all the containers are up and running. If you are using _Rancher Desktop_, you can use the
[Rancher Dashboard](#rancher-dashboard) to see when the cluster is ready. Otherwise, run
`kubectl -n thecombine get deployments` or `kubectl -n thecombine get pods`. For example,

```console
$ kubectl -n thecombine get deployments
NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
backend                        1/1     1            1           10m
database                       1/1     1            1           10m
frontend                       1/1     1            1           10m
maintenance                    1/1     1            1           10m
otel-opentelemetry-collector   1/1     1            1           19m
```

or

```console
$ kubectl -n thecombine get pods
NAME                                            READY   STATUS      RESTARTS   AGE
backend-5657559949-z2flp                        1/1     Running     0          10m
database-794b4d956f-zjszm                       1/1     Running     0          10m
frontend-7d6d79f8c5-lkhhz                       1/1     Running     0          10m
install-fonts-4jcsl                             0/1     Completed   0          8m
maintenance-7f4b5b89b8-rhgk9                    1/1     Running     0          10m
otel-opentelemetry-collector-5b5b69557b-zqk5d   1/1     Running     0          19m
```

### Connecting to Your Cluster

#### Setup Port Forwarding

_Rancher Desktop only!_

To connect to _The Combine_ user interface on _Rancher Desktop_, you need to setup port forwarding.

1. From the _Rancher Desktop_ main window, click on _Port Forwarding_ on the left-hand side.
2. Click the _Forward_ button to the left of the `https` port for `ingress-controller-ingress-nginx-controller` in the
   `ingress-nginx` namespace: ![alt text](docs/images/rancher-desktop-port-forward.png "Rancher Desktop Port Forward")
3. A random port number is displayed. You may change it or accept the value and click the checkmark.

Note that the port forwarding is not persistent; you need to set it up whenever _Rancher Desktop_ is restarted.

#### Connecting to _The Combine_

You can connect to _The Combine_ by entering the URL `https://thecombine.localhost` in the address bar of your web
browser. (`https://thecombine.localhost:<portnumber>` for _Rancher Desktop_)

Notes:

1. If you do not specify the `https://`, your browser may do a web search instead of navigating to _The Combine_.
2. _By default self-signed certificates are used, so you will need to accept a warning in the browser._

### Rancher Dashboard

The Rancher Dashboard shows an overview of your Kubernetes cluster. The left-hand pane allows you to explore the
different Kubernetes resources that are deployed in the cluster. This includes viewing configuration, current states,
and logs:

![alt text](docs/images/rancher-desktop-dashboard.png "Rancher Desktop Dashboard")

To open the _Rancher Dashboard_, right-click on the Rancher Desktop icon in the system tray and select `Dashboard` from
the pop-up menu:

![alt text](docs/images/rancher-desktop-menu.png "Starting Rancher Desktop Dashboard")

## Maintenance

The maintenance scripts enable certain maintenance tasks on your instance of _TheCombine_. _TheCombine_ may be running
in either a development environment or the production/qa environment.

### Development Environment

The following maintenance tasks can be performed in the development environment. To run _TheCombine_ in the development
environment, run `npm start` from the project directory. Unless specified otherwise, each of the maintenance commands
are to be run from the project directory.

#### Create a New Admin User (Development)

Task: create a new user who is a site administrator

Commands

- set/export `COMBINE_ADMIN_PASSWORD`
- set/export `COMBINE_ADMIN_EMAIL`
- run

  ```bash
  cd Backend
  dotnet run create-admin-username=admin
  ```

#### Drop Database

Task: completely erase the current Mongo database

Run:

```bash
npm run drop-database
```

#### Grant Admin Rights

Task: grant site admin rights for an existing user

Run:

```bash
# Note the '--' before the user name
npm run set-admin-user -- <USERNAME>
```

### Kubernetes Environment

The following maintenance tasks can be performed in the Kubernetes environment. The Kubernetes cluster may be one of the
production or QA clusters or the local development cluster. For most of these tasks, the _Rancher Dashboard_ provides a
more user-friendly way to maintain and manage the cluster.

For each of the `kubectl` commands below:

- you must have a `kubectl` configuration file that configures the connection to the kubernetes cluster to be
  maintained. The configuration file needs to installed at `${HOME}/.kube/config` or specified in the `KUBECONFIG`
  environment variable.
- the `kubectl` commands can be run from any directory
- any of the Python scripts (local or remote using `kubectl`) can be run with the `--help` option to see more usage
  options.

#### Stopping _The Combine_

To stop _The Combine_ without deleting it, you scale it back to 0 replicas running:

```bash
kubectl -n thecombine scale --replicas=0 deployments frontend backend maintenance database otel-opentelemetry-collector
```

You can restart the deployments by setting `--replicas=1`.

#### Deleting Helm Charts

Deleting a helm chart will delete all Kubernetes resources including any persistent data or any data stored in a
container.

In addition to clearing out old data, there may be cases where existing charts need to be deleted and re-installed
instead of upgraded, for example, when a configuration change requires changes to an immutable attribute of a resource.

To delete a chart, first list all of the existing charts:

```console
$ helm list -A
NAME                NAMESPACE       REVISION    UPDATED                                 STATUS      CHART                   APP VERSION
cert-manager        cert-manager    3           2022-02-28 11:27:12.141797222 -0500 EST deployed    cert-manager-v1.7.1     v1.7.1
ingress-controller  ingress-nginx   3           2022-02-28 11:27:15.729203306 -0500 EST deployed    ingress-nginx-4.0.17    1.1.1
rancher             cattle-system   1           2022-03-11 12:46:06.962438027 -0500 EST deployed    rancher-2.6.3           v2.6.3
thecombine          thecombine      2           2022-03-11 11:41:38.304404635 -0500 EST deployed    thecombine-0.7.14       2.0.0
```

Using the chart name and namespace, you can then delete the chart:

```bash
helm -n <chart_namespace> delete <chart_name>
```

where `<chart_namespace>` and `<chart_name>` are the `NAMESPACE` and `NAME` respectively of the chart you want to
delete. These are listed in the output of `helm list -A`.

You can delete the entire `thecombine` namespace and its charts with `kubectl delete namespace thecombine`. However,
then you will have to rerun `setup_cluster.py` (to install `otel-opentelemetry-collector`) before `setup_combine.py`.

#### Checking The System Status

Once _The Combine_ is installed, it is useful to be able to see the state of the system and to look at the logs. _The
Combine_ is setup as five deployments:

- frontend
- backend
- database
- maintenance
- otel/opentelemetry-collector

Each deployment definition is used to create a _pod_ that runs the docker image.

To see the state of the deployments, run:

```console
$ kubectl -n thecombine get deployments
NAME                              READY   UP-TO-DATE   AVAILABLE   AGE
database                          1/1     1            1           3h41m
maintenance                       1/1     1            1           3h41m
backend                           1/1     1            1           3h41m
frontend                          1/1     1            1           3h41m
otel/opentelemetry-collector      1/1     1            1           3h46m
```

Similarly, you can view the state of the pods:

```console
$ kubectl -n thecombine get pods
NAME                                                READY   STATUS      RESTARTS        AGE
database-794b4d956f-g2n5k                           1/1     Running     1 (3h51m ago)   3h58m
install-fonts-fvrb4                                 0/1     Completed   0               164m
maintenance-85644b9c76-55pz8                        1/1     Running     0               130m
backend-69b77c46c5-8dqlv                            1/1     Running     0               130m
frontend-c94c5747c-pz6cc                            1/1     Running     0               60m
otel/opentelemetry-collector-5cd6b9c867-6j5zb       1/1     Running     0               4h03m
```

Use the `logs` command to view the log file of a pod; you can specify the pod name listed in the output of the
`kubectl -n thecombine get pods` command or the deployment, for example, to view the logs of the frontend, you would
run:

```bash
kubectl -n thecombine logs frontend-c94c5747c-pz6cc
```

or

```bash
kubectl -n thecombine logs deployment/frontend
```

If you want to monitor the logs while the system is running, add the `--follow` option to the command.

#### Add a User to a Project

Task: add an existing user to a project

Run:

```bash
kubectl -n thecombine exec -it deployment/maintenance -- add_user_to_proj.py --project <PROJECT_NAME> --user <USER>
```

For additional options, run:

```bash
kubectl -n thecombine exec -it deployment/maintenance -- add_user_to_proj.py --help
```

#### Backup _TheCombine_

Task: Backup the CombineDatabase and the Backend files to the Amazon Simple Storage Service (S3).

Run:

```bash
kubectl -n thecombine exec -it deployment/maintenance -- combine_backup.py [--verbose]
```

Notes:

1. The backup command can be run from any directory.
2. The daily backup job on the server will also clean up old backup for the machine that is being backed up. This is not
   part of `combine_backup.py`; backups made with this script must be managed manually. See the
   [AWS CLI Command Reference (s3)](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/index.html)
   for documentation on how to use the command line to list and to manage the backup objects.

#### Delete a Project

Task: Delete a project

Run:

```bash
kubectl -n thecombine exec -it deployment/maintenance -- rm_project.py <PROJECT_NAME>
```

You may specify more than one `<PROJECT_NAME>` to delete multiple projects.

#### Restore _TheCombine_

Task: Restore the CombineDatabase and the Backend files from a backup stored on the Amazon Simple Storage Service (S3).

Run:

```bash
kubectl -n thecombine exec -it deployment/maintenance -- combine_restore.py [--verbose] [BACKUP_NAME]
```

Note:

The restore script takes an optional backup name. This is the name of the backup in the AWS S3 bucket, not a local file.
If the backup name is not provided, the restore script will list the available backups and allow you to choose one for
the restore operation.

## User Guide

The User Guide found at <https://sillsdev.github.io/TheCombine> is automatically built from the `master` branch.

To locally build the user guide and serve it dynamically (automatically reloading on change), run the following from
your Python virtual environment:

```bash
tox -e user-guide-serve
```

To locally build the user guide statically into `docs/user-guide/site`:

```bash
tox -e user-guide
```

## Continuous Integration and Continuous Deployment

### On Pull Request

When a Pull Request (PR) is created and for each push to the PR branch, a set of CI tests are run. When all the CI tests
pass _and_ the PR changes have been reviewed and approved by a team member, then the PR may be merged into the `master`
branch. When the merge is complete, _The Combine_ software is built, pushed to the AWS ECR Private registry, and
deployed to the QA server:

```mermaid
sequenceDiagram
   actor Author
   actor Reviewer
   participant github as sillsdev/TheCombine
   participant gh_runner as GitHub Runner
   participant sh_runner as Self-Hosted Runner
   participant reg as AWS Private Registry
   participant server as QA Server
   Author ->> github: create Pull Request(work_branch)
   activate github
   par
      loop for each CI test
        Note over github,gh_runner: CI tests are run concurrently
        github ->> gh_runner: start CI test
         activate gh_runner
            gh_runner ->> gh_runner: checkout work_branch
            gh_runner ->> gh_runner: run test
            gh_runner -->> github: test passed
         deactivate gh_runner
      end
   and
      github ->> Reviewer: request review
      Reviewer -->> github: approved
   end
   github ->> github: merge work_branch to master
   github ->> github: delete work_branch
   github ->> gh_runner: run deploy_qa workflow
   activate gh_runner
   loop component in (frontend, backend, database, maintenance)
      Note right of gh_runner: components are built concurrently
      gh_runner ->> gh_runner: checkout master
      gh_runner ->> gh_runner: build component
      gh_runner ->> reg: push component image(image_tag)
      gh_runner -->> github: build complete(image_tag)
   end
   deactivate gh_runner
   github ->> sh_runner: deploy to QA server(image_tag)
   activate sh_runner
   loop deployment in (frontend, backend, database, maintenance)
      sh_runner -) server: update deployment image(image_tag)
      server ->> reg: pull image(image_tag)
      reg -->> server: updated image(image_tag)
   end
   deactivate sh_runner
```

### On Release

When a team member creates a release on _The Combine's_ GitHub project page, a Release tag is created on the master
branch, the software is built and pushed to the AWS ECR Public registry and then deployed to the production server.

```mermaid
sequenceDiagram
   actor Developer
   participant github as sillsdev/TheCombine
   participant gh_runner as GitHub Runner
   participant sh_runner as Self-Hosted Runner
   participant reg as AWS Public Registry
   participant server as Production Server
   Developer ->> github: create Release
   github ->> github: create release tag on master branch
   github ->> gh_runner: run deploy_release workflow
   activate gh_runner
   loop component in (frontend, backend, database, maintenance)
      Note right of gh_runner: components are built concurrently
      gh_runner ->> gh_runner: checkout release tag
      gh_runner ->> gh_runner: build component
      gh_runner ->> reg: push component image(image_tag)
      gh_runner -->> github: build complete(image_tag)
   end
   deactivate gh_runner
   github ->> sh_runner: deploy to Production server(image_tag)
   activate sh_runner
   loop deployment in (frontend, backend, database, maintenance)
      sh_runner -) server: update deployment image(image_tag)
      server ->> reg: pull image(image_tag)
      reg -->> server: updated image(image_tag)
   end
   deactivate sh_runner
```

## Production

The process for configuring and deploying _TheCombine_ for production targets is described in
[docs/deploy/README.md](docs/deploy/README.md).

## Learn More

### Development Tools

- [Git branching tutorial](https://learngitbranching.js.org)

### Database (MongoDB)

- [MongoDB](https://docs.mongodb.com/manual/introduction)
- [MongoDB tutorial](https://university.mongodb.com/courses/M001/about)

### Backend (C# + ASP.NET)

- [C#](https://www.w3schools.com/cs/default.asp)
- [Our style guide](docs/style_guide/c_sharp_style_guide.md)
- [ASP.NET](https://docs.microsoft.com/en-us/aspnet/core/getting-started)
- [NUnit](https://docs.nunit.org/articles/nunit/intro.html) (unit testing)

### Frontend (Typescript + React + Redux)

- [JS](https://www.w3schools.com/js/default.asp)
- [TS](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [Our style guide](docs/style_guide/ts_style_guide.md)
- [React](https://react.dev/learn)
- [React Hooks](https://react.dev/reference/react/hooks)
- [MUI](https://mui.com/material-ui/getting-started/) (styled/themed components)
- [Redux concepts](https://redux.js.org/tutorials/fundamentals/part-2-concepts-data-flow)
- [Redux tutorials](https://redux.js.org/tutorials/typescript-quick-start)
- [React-i18next](https://react.i18next.com/) (text localization)
- [Jest](https://jestjs.io/docs/getting-started) (unit testing)
- [React-Test-Renderer](https://reactjs.org/docs/test-renderer.html) (unit testing)

### Kubernetes/Helm

- [Kubernetes Concepts](https://kubernetes.io/docs/concepts/)
- [Kubernetes Tutorials](https://kubernetes.io/docs/tutorials/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Helm Documentation](https://helm.sh/docs/) has links for:

  - [Introduction](https://helm.sh/docs/intro/),
  - [Topic Guides](https://helm.sh/docs/topics/),
  - [Best Practices](https://helm.sh/docs/chart_best_practices),
  - [Chart Template Guide](https://helm.sh/docs/chart_template_guide),
  - [Helm Commands](https://helm.sh/docs/helm),

  and more.
