# The Combine

[![Frontend Actions Status][github-actions-frontend-badge]][github-actions]
[![Frontend Coverage][frontend-codecov-badge]][codecov]
[![Backend Actions Status][github-actions-backend-badge]][github-actions]
[![Backend Coverage][backend-codecov-badge]][codecov] [![Language grade: JavaScript][lgtm-js-badge]][lgtm-js]
[![Total alerts][lgtm-alerts-badge]][lgtm-alerts]
[![Python Actions Status][github-actions-python-badge]][github-actions]

[![GitHub release][github-release-badge]][github-version] [![GitHub version][github-version-badge]][github-version]
![Localization][localization-badge] [![GitHub][github-license-badge]][github-license]
[![GitHub contributors][github-contribs-badge]][github-contribs]

[github-actions-frontend-badge]: https://github.com/sillsdev/TheCombine/workflows/frontend/badge.svg
[frontend-codecov-badge]: https://codecov.io/gh/sillsdev/TheCombine/branch/master/graph/badge.svg?flag=frontend
[codecov]: https://codecov.io/gh/sillsdev/TheCombine
[github-actions-backend-badge]: https://github.com/sillsdev/TheCombine/workflows/backend/badge.svg
[backend-codecov-badge]: https://codecov.io/gh/sillsdev/TheCombine/branch/master/graph/badge.svg?flag=backend
[github-actions-python-badge]: https://github.com/sillsdev/TheCombine/workflows/python/badge.svg
[github-actions]: https://github.com/sillsdev/TheCombine/actions
[lgtm-js-badge]: https://img.shields.io/lgtm/grade/javascript/g/sillsdev/TheCombine.svg?logo=lgtm&logoWidth=18
[lgtm-js]: https://lgtm.com/projects/g/sillsdev/TheCombine/context:javascript
[lgtm-alerts-badge]: https://img.shields.io/lgtm/alerts/g/sillsdev/TheCombine.svg?logo=lgtm&logoWidth=18
[lgtm-alerts]: https://lgtm.com/projects/g/sillsdev/TheCombine/alerts
[localization-badge]: https://img.shields.io/badge/localization-En%20Es%20Fr-blue
[github-version-badge]: https://img.shields.io/github/package-json/v/sillsdev/TheCombine
[github-release-badge]: https://img.shields.io/github/v/release/sillsdev/TheCombine
[github-version]: https://github.com/sillsdev/TheCombine/releases
[github-license-badge]: https://img.shields.io/github/license/sillsdev/TheCombine
[github-license]: https://github.com/sillsdev/TheCombine/blob/master/LICENSE
[github-contribs-badge]: https://img.shields.io/github/contributors/sillsdev/TheCombine?cacheSeconds=10000
[github-contribs]: https://github.com/sillsdev/TheCombine/graphs/contributors

A rapid word collection tool.

## Table of Contents

1. [Getting Started with Development](#getting-started-with-development)
2. [Available Scripts](#available-scripts)
   1. [Running in Development](#running-in-development)
   2. [Running the Automated Tests](#running-the-automated-tests)
   3. [Import Semantic Domains](#import-semantic-domains)
   4. [Generate License Report](#generate-license-report)
   5. [Set Project Version](#set-project-version)
3. [Maintenance Scripts for TheCombine](#maintenance-scripts-for-thecombine)

   1. [Environments](#environments)
   2. [Development Environment Scripts](#development-environment-scripts)
   3. [Local Docker Container Scripts](#local-docker-container-scripts)

   4. [Production Environment Scripts](#production-environment-scripts)

4. [Docker](#docker)
   1. [Installing Docker](#installing-docker)
   2. [Build and Run](#build-and-run)
5. [Python](#python)
   1. [Windows Python Installation](#windows-python-installation)
   2. [Linux Python Installation](#linux-python-installation)
   3. [macOS Python Installation](#macos-python-installation)
   4. [Python Packages](#python-packages)
6. [User Guide](#user-guide)
7. [Production](#production)
8. [Learn More](#learn-more)

## Getting Started with Development

1. Clone this repo:

   ```bash
   $ git clone https://github.com/sillsdev/TheCombine.git
   ```

2. Install:
   - [Node.js 14 (LTS)](https://nodejs.org/en/download/)
     - On Windows, if using [Chocolatey][chocolatey]: `choco install nodejs-lts`
     - On Ubuntu, follow
       [this guide](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions) using
       the appropriate Node.js version.
   - [.NET Core SDK 3.1 (LTS)](https://dotnet.microsoft.com/download/dotnet-core/3.1)
     - On Ubuntu 18.04, follow these
       [instructions](https://docs.microsoft.com/en-us/dotnet/core/install/linux-package-manager-ubuntu-1804).
   - [MongoDB](https://docs.mongodb.com/manual/administration/install-community/) and add /bin to PATH Environment
     Variable
     - On Windows, if using [Chocolatey][chocolatey]: `choco install mongodb`
   - [VS Code](https://code.visualstudio.com/download) and the following extensions:
     - C# (`ms-dotnettools.csharp`)
     - Prettier - Code formatter (`esbenp.prettier-vscode`)
   - [chocolatey](https://chocolatey.org/): (Windows only) a Windows package manager.
   - [dotnet-format](https://github.com/dotnet/format): `dotnet tool update --global dotnet-format --version 4.1.131201`
   - [dotnet-reportgenerator](https://github.com/danielpalme/ReportGenerator)
     `dotnet tool update --global dotnet-reportgenerator-globaltool --version 4.6.1`
3. (Windows Only) Run `dotnet dev-certs https` and `dotnet dev-certs https --trust` to generate and trust an SSL
   certificate.
4. (Linux,macOS Only) Install
   [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) and then:

   - configure `git` to use `ansible-vault` for comparing encrypted vault files:
     ```
     git config --global diff.ansible-vault.textconv "ansible-vault view"
     ```
   - save the ansible vault password in a file, e.g. `${HOME}/.vault-password`
   - set the permissions for the vault password file to `0600`
   - edit your `.profile` to export the enviroment variable `ANSIBLE_VAULT_PASSWORD_FILE` set to the path of the file
     with the vault password:
     ```
     export ANSIBLE_VAULT_PASSWORD_FILE=${HOME}/.vault-password
     ```

5. Set the environment variable `COMBINE_JWT_SECRET_KEY` to a string **containing at least 16 characters**, such as
   _This is a secret key_. Set it in your `.profile` (Linux or Mac 10.14-), your `.zprofile` (Mac 10.15+), or the
   _System_ app (Windows).
6. If you want the email services to work you will need to set the following environment variables. These values must be
   kept secret, so ask your email administrator to supply them.

   - `COMBINE_SMTP_SERVER`
   - `COMBINE_SMTP_PORT`
   - `COMBINE_SMTP_USERNAME`
   - `COMBINE_SMTP_PASSWORD`
   - `COMBINE_SMTP_ADDRESS`
   - `COMBINE_SMTP_FROM`

7. Run `npm start` from the project directory to install dependencies and start the project.

8. Consult our [C#](docs/style_guide/c_sharp_style_guide.md) and [TypeScript](docs/style_guide/ts_style_guide.md) style
   guides for best coding practices in this project.

## Available Scripts

### Running in Development

In the project directory, you can run:

#### `npm start`

> Note: To avoid browser tabs from being opened automatically every time the frontend is launched, set
> [`BROWSER=none`](https://create-react-app.dev/docs/advanced-configuration/) environment variable.

Installs the necessary packages and runs the app in the development mode.<br> Open
[http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br> You will also see any lint errors in the console.

> Note: You may need to first browse to https://localhost:5001 and accept the certificate warning in your browser if you
> get Network Errors the first time you try to run the application locally.

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

### Running the Automated Tests

#### `npm test`

Run all backend and frontend tests.

#### `npm run test-backend`

Run all backend unit tests.

To run a subset of tests, use the
[`--filter`](https://docs.microsoft.com/en-us/dotnet/core/testing/selective-unit-tests?pivots=nunit) option.

```bash
# Note the extra -- needed to separate arguments for npm vs script.
$ npm run test-backend -- --filter FullyQualifiedName~Backend.Tests.Models.ProjectTests
```

#### `npm run test-frontend`

Launches the test runners in the interactive watch mode.<br> See the section about
[running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

To run a subset of tests, pass in the name of a partial file path to filter:

```bash
# Note the extra -- needed to separate arguments for npm vs script.
$ npm run test-frontend -- DataEntry
```

#### `npm run test-*:coverage`

Launches the test runners to calculate the test coverage of the frontend or backend of the app.

##### Frontend Code Coverage Report

Run:

```bash
$ npm run test-frontend:coverage
```

To view the frontend code coverage open `coverage/lcov-report/index.html` in a browser.

##### Backend Code Coverage Report

Run:

```bash
$ npm run test-backend:coverage
```

Generate the HTML coverage report:

```bash
$ npm run gen-backend-coverage-report
```

Open `coverage-backend/index.html` in a browser.

#### `npm run test-frontend:debug`

Runs Jest tests for debugging, awaiting for an attach from an IDE.

For VSCode, run the **Debug Jest Tests** configuration within the Run tab on the left taskbar.

#### `npm run fmt-backend`

Automatically format the C# source files in the backend.

#### `npm run lint`

Runs ESLint on the codebase to detect code problems that should be fixed.

#### `npm run fmt-frontend`

Auto-format frontend code in the `src` folder.

### Import Semantic Domains

Imports Semantic Domains from the provided xml file.

```bash
$ npm run import-sem-doms -- <XML_FILE_PATH>
```

### Generate License Report

To generate a summary of licenses used in production:

```bash
$ npm run license-summary
```

To generate a full report of the licenses used in production:

```bash
$ npm run license-report
```

### Set Project Version

To update the version of the project:

1. Edit package.json `"version"` to a [semantic versioning](https://docs.npmjs.com/about-semantic-versioning) compatible
   string (e.g. `"0.1.1-alpha.0"`).
2. Run `npm install` to automatically update `package-lock.json`.

To retrieve the current version of the project from the terminal:

```bash
$ npm run --silent version
```

## Maintenance Scripts for TheCombine

### Environments

There are three different environments in which _TheCombine_ may be run:

1. _Development Environment_ - To run _TheCombine_ in the development environment, run `npm start` from the project
   directory.
2. _In Local Docker Containers_ - To run _TheCombine_ from your software development project inside Docker containers
   see the [Docker](#docker) section.
3. _Production Environment_ - The
   [How To Deploy TheCombine](#https://github.com/sillsdev/TheCombine/blob/master/docs/deploy/README.md) Document
   describes how to configure a production machine and install _TheCombine_ on it.

### Development Environment Scripts

#### Inspect Database

To browse the database locally during development, open MongoDB Compass Community.

1. Under New Connection, enter `mongodb://localhost:27017`
2. Under Databases, select CombineDatabase

#### Drop Database

To completely erase the current Mongo database, run:

```bash
$ npm run drop-database
```

#### Create a New Admin User

To create a new admin user:

1. first set the required environment variables:
   - `COMBINE_ADMIN_PASSWORD`
   - `COMBINE_ADMIN_EMAIL`
2. run:

   ```bash
   $ cd Backend
   $ dotnet run create-admin-username=admin
   ```

The exit code will be set to `0` on success and non-`0` otherwise.

#### Grant Admin Rights

To grant admin rights for an existing user, run:

```bash
# Note the -- before the user name.
$ npm run set-admin-user -- <USERNAME>
```

### Local Docker Container Scripts

This section assumes that the project docker environment has been initialized and started. It is important that each of
the commands listed are run from the project root directory because the `docker-compose` commands expect the
`docker-compose.yml` file to be in the working directory.

#### Create a New Admin User

Run:

```bash
$ docker-compose run -e COMBINE_ADMIN_USERNAME=<USER_NAME> -e COMBINE_ADMIN_PASSWORD="<PASSWORD>" -e COMBINE_ADMIN_EMAIL="<EMAIL_ADDRESS>" backend
```

filling in your values for `<USER_NAME>`, `<PASSWORD>`, and `<EMAIL_ADDRESS>`.

#### Grant Admin Rights

To grant admin rights for an existing user, run:

```bash
$ deploy/roles/combine_maintenance/files/make_user_admin.py <USER_NAME>
```

Note that you may specify more than one `<USER_NAME>` to update multiple users.

#### Delete a Project

To delete a project, run:

```bash
$ deploy/roles/combine_maintenance/files/rm_project.py <PROJECT_NAME>
```

Note that you may specify more than one `<PROJECT_NAME>` to delete multiple projects.

#### Add a User to a Project

To add a user to a project, run:

```bash
$ deploy/roles/combine_maintenance/files/add_user_to_proj.py  --project <PROJECT_NAME> --user <USER>
```

Notes:

1. The `--project` and `--user` options may be shortened to `--p` and `--u` respectively.
2. The user is added to the project with normal project member permissions (`[3,2,1]`). Add the `--admin` option to add
   the user with project administrator permissions (`[5,4,3,2,1]`)

### Production Environment scripts

This method is for the case where _TheCombine_ has been deployed to a system according to the
[How To Deploy TheCombine](#https://github.com/sillsdev/TheCombine/blob/master/docs/deploy/README.md) document.

For each of the commands below, use `ssh` to connect to the target system where _TheCombine_ is running and run the
following commands to set the user and working directory:

```bash
sudo su -l combine
cd /opt/combine
```

#### Create a New Admin User

The site administrator is created by the `playbook_install.yml` as described in the
[How To Deploy TheCombine](#https://github.com/sillsdev/TheCombine/blob/master/docs/deploy/README.md) document.

#### Grant Admin Rights

To grant admin rights for an existing user, run:

```bash
$ bin/make_user_admin.py <USER_NAME>
```

Note that you may specify more than one `<USER_NAME>` to update multiple users.

#### Delete a Project

To delete a project, run:

```bash
$ bin/rm_project.py <PROJECT_NAME>
```

Note that you may specify more than one `<PROJECT_NAME>` to delete multiple projects.

#### Add a User to a Project

To add a user to a project, run:

```bash
$ bin/add_user_to_proj.py  --project <PROJECT_NAME> --user <USER>
```

Notes:

1. The `--project` and `--user` options may be shortened to `--p` and `--u` respectively.
2. The user is added to the project with normal project member permissions (`[3,2,1]`). Add the `--admin` option to add
   the user with project administrator permissions (`[5,4,3,2,1]`)

## Docker

### Installing Docker

Install [Docker](https://docs.docker.com/get-docker/).

(Linux Only) Install [Docker Compose](https://docs.docker.com/compose/install/) separately. This is included by default
in Docker Desktop for Windows and macOS.

(macOS / Windows Only) If you are on macOS or Windows without
[WSL2 installed](https://docs.microsoft.com/en-us/windows/wsl/install-win10) you must ensure that Docker Desktop is
allocated at least 4GB of Memory in Preferences | Resources.

### Build and Run

For information on _Docker Compose_ see the [Docker Compose documentation](https://docs.docker.com/compose/).

1. Create the required docker files by running the configuration script in an activated Python virtual environment from
   _TheCombine_'s project directory. (See the [Python](#python) section to create the virtual environment.)

```bash
(venv) $ python scripts/docker_setup.py

# To view options, run with --help
```

2. The `docker_setup.py` will generate a file, `.env.backend`, that defines the environment variables needed by the
   Backend container. If you have defined them as OS variables in the
   [Getting Started with Development](#getting-started-with-development) section above, then these variables will
   already be set. If not, then you will need to edit `.env.backend` and provide values for the variables that are
   listed.

3. Build the images for the Docker containers (**Note**: On Linux, you will need to prepend `sudo` to all of the
   following `docker` commands). On Windows and macOS, Docker Desktop must be running.

   ```bash
   $ docker-compose build --parallel
   ```

4. Start the containers

   ```bash
   $ docker-compose up --detach
   ```

5. Browse to https://localhost.

   _By default self-signed certificates are included, so you will need to accept a warning in the browser._

6. To view logs:

   ```bash
   $ docker-compose logs --follow
   ```

7. To stop

   ```bash
   $ docker-compose down
   ```

   Add the `--volumes` option to remove any stored data when the containers are stopped.

## Python

A Python script, `scripts/docker_setup.py` is used to configure the files needed to run _TheCombine_ in Docker
containers. Python is required to create the `docker-compose` environment and to run some of the maintenance scripts.

### Windows Python Installation

- Navigate to the [Python Downloads](https://www.python.org/downloads/) page.

- Select the "Download Python" button at the top of the page. This will download the latest appropriate x86-64
  executable installer.

- Once Python is installed, create an isolated Python [virtual environment](https://docs.python.org/3/library/venv.html)
  using the [`py`](https://docs.python.org/3/using/windows.html#getting-started) launcher installed globally into the
  `PATH`.

```bash
$ py -m venv venv
$ venv\Scripts\activate
```

### Linux Python Installation

To install Python 3 on Ubuntu, run the following commands:

```bash
$ sudo apt update
$ sudo apt install python3 python3-venv
```

Create an isolated Python virtual environment

```bash
$ python3 -m venv venv
$ . venv/bin/activate
```

### macOS Python Installation

Install [Homebrew](https://brew.sh/).

Install Python 3 using Homebrew:

```bash
$ brew install python
```

Once Python is installed, create an isolated Python virtual environment:

```bash
$ python3 -m venv venv
$ source venv/bin/activate
```

### Python Packages

**Important**: All Python commands and scripts should be executed within a terminal using an activated Python virtual
environment. This will be denoted with the `(venv)` prefix on the prompt.

With an active virtual environment, install Python development requirements for this project:

```bash
(venv) $ python -m pip install --upgrade pip pip-tools
(venv) $ pip-sync dev-requirements.txt
```

Note, you can also now perform automated code formatting of Python code:

```bash
(venv) $ tox -e fmt
```

To run all Python linting steps:

```bash
(venv) $ tox
```

To upgrade all pinned dependencies, run the following command under Python 3.6 so the requirements are
backwards-compatible.

```bash
(venv) $ pip-compile --upgrade dev-requirements.in
```

Then manually remove `dataclasses==` line from `dev-requirements.txt`. This is to work around a pinning issue with
supporting Python 3.6 and 3.7+.

## User Guide

To build the user guide and serve it dynamically (automatically reloading on change), run the following from your Python
virtual environment:

```bash
(venv) $ tox -e user-guide-serve
```

To build the user guide statically into `docs/user-guide/site`:

```bash
(venv) $ tox -e user-guide
```

## Production

The process for configuring and deploying _TheCombine_ for production targets is described in
[docs/deploy/README.md](docs/deploy/README.md).

## Learn More

- [React](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [React-Redux](https://redux.js.org/basics/usage-with-react)
- [React-Localize-Redux](https://ryandrewjohnson.github.io/react-localize-redux/) (Language Localization)
- [ASP.NET](https://docs.microsoft.com/en-us/aspnet/core/getting-started/?view=aspnetcore-3.1)

```

```
