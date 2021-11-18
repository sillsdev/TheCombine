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

A rapid word collection tool. See the [User Guide](https://sillsdev.github.io/TheCombine) for uses and features.

## Table of Contents

1. [Getting Started with Development](#getting-started-with-development)
2. [Docker](#docker)
   1. [Installing Docker](#installing-docker)
   2. [Build and Run](#build-and-run)
3. [Python](#python)
   1. [Windows Python Installation](#windows-python-installation)
   2. [Linux Python Installation](#linux-python-installation)
   3. [macOS Python Installation](#macos-python-installation)
   4. [Python Packages](#python-packages)
4. [Amazon Web Services](#amazon-web-services)
   1. [Installing `aws-cli`](#installing-aws-cli)
   2. [Configuring `aws-cli`](#configuring-aws-cli)
5. [Available Scripts](#available-scripts)
   1. [Running in Development](#running-in-development)
   2. [Using OpenAPI](#using-openapi)
   3. [Running the Automated Tests](#running-the-automated-tests)
   4. [Import Semantic Domains](#import-semantic-domains)
   5. [Generate License Reports](#generate-license-reports)
   6. [Set Project Version](#set-project-version)
   7. [Inspect Database](#inspect-database)
   8. [Cleanup Local Repo](#cleanup-local-repository)
6. [Maintenance Scripts for TheCombine](#maintenance-scripts-for-thecombine)
   1. [Add a User to a Project](#add-a-user-to-a-project)
   2. [Backup _TheCombine_](#backup-thecombine)
   3. [Create a New Admin User](#create-a-new-admin-user)
   4. [Delete a Project](#delete-a-project)
   5. [Drop Database](#drop-database)
   6. [Grant Admin Rights](#grant-admin-rights)
   7. [Restore _TheCombine_](#restore-thecombine)
7. [User Guide](#user-guide)
8. [Production](#production)
9. [Learn More](#learn-more)

## Getting Started with Development

1. Clone this repo:

   ```bash
   $ git clone https://github.com/sillsdev/TheCombine.git
   ```

2. Install:
   - [Node.js 16 (LTS)](https://nodejs.org/en/download/)
     - On Windows, if using [Chocolatey][chocolatey]: `choco install nodejs-lts`
     - On Ubuntu, follow
       [this guide](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions) using
       the appropriate Node.js version.
   - [.NET Core SDK 5.0](https://dotnet.microsoft.com/download/dotnet/5.0)
     - On Ubuntu 20.04, follow these
       [instructions](https://docs.microsoft.com/en-us/dotnet/core/install/linux-ubuntu#2004-).
   - [MongoDB](https://docs.mongodb.com/manual/administration/install-community/) and add /bin to PATH Environment
     Variable
     - On Windows, if using [Chocolatey][chocolatey]: `choco install mongodb`
   - [VS Code](https://code.visualstudio.com/download) and the following extensions:
     - C# (`ms-dotnettools.csharp`)
     - Prettier - Code formatter (`esbenp.prettier-vscode`)
   - [Chocolatey][chocolatey]: (Windows only) a Windows package manager.
   - [dotnet-format](https://github.com/dotnet/format): `dotnet tool update --global dotnet-format --version 5.0.211103`
   - [dotnet-reportgenerator](https://github.com/danielpalme/ReportGenerator)
     `dotnet tool update --global dotnet-reportgenerator-globaltool --version 4.6.1`
   - [dotnet-project-licenses](https://github.com/tomchavakis/nuget-license)
     `dotnet tool update --global dotnet-project-licenses`
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
   - edit your `.profile` to export the environment variable `ANSIBLE_VAULT_PASSWORD_FILE` set to the path of the file
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

7. (Optional) To opt in to segment.com analytics to test the analytics during development:

   ```bash
   # For Windows, use `copy`.
   $ cp .env.local.template .env.local
   ```

8. Run `npm start` from the project directory to install dependencies and start the project.

9. Consult our [C#](docs/style_guide/c_sharp_style_guide.md) and [TypeScript](docs/style_guide/ts_style_guide.md) style
   guides for best coding practices in this project.

Note, those starting development can skip the following sections related to production or deployment: 2. Docker, 4.
Amazon Web Services.

[chocolatey]: https://chocolatey.org/

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

> Note: If you get an `unexpected character ...` error, you may need to run `docker-compose disable-v2` then try the
> above build again.

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

To view the logs from a single service, e.g. the `backend`:

```bash
$ docker-compose logs --follow backend
```

The `--follow` option (abbreviated as -f) will show you the current logs and update the display as items are logged. To
just get the current snapshot of the logs, do not add the `--follow` option.

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

Create and activate an isolated Python virtual environment

```bash
$ python3 -m venv venv
# This command is shell-specific, for the common use case of bash:
$ source venv/bin/activate
```

### macOS Python Installation

Install [Homebrew](https://brew.sh/).

Install Python 3 using Homebrew:

```bash
$ brew install python
```

Create and activate isolated Python virtual environment:

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
(venv) $ python -m piptools sync dev-requirements.txt
```

Note, you can also now perform automated code formatting of Python code:

```bash
(venv) $ tox -e fmt
```

To run all Python linting steps:

```bash
(venv) $ tox
```

To upgrade all pinned dependencies:

```bash
(venv) $ python -m piptools compile --upgrade dev-requirements.in
```

## Amazon Web Services

_TheCombine_ stores its backup in an Amazon Simple Storage Service (S3) bucket. In order to run the backup and restore
scripts for _TheCombine_, you will need to install and configure the `aws-cli`, version 2.

### Installing `aws-cli`

To install `aws-cli` follow the instructions for your operating system:

- [AWS CLI for Windows](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-windows.html)
- [AWS CLI for Linux](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux.html)
- [AWS CLI for macOS](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-mac.html)

### Configuring `aws-cli`

Once `aws-cli` is installed, you will need to configure it so that it has access to the bucket where _TheCombine's_
backup are stored. Configure your access by running:

```
aws configure
```

You will be prompted for the following information:

- AWS Access Key ID
- AWS Secret Access Key
- Default region name
- Default output format

Choose the default, `None`, for the _Default output format_. The other items will be provided through a secure
communication mechanism.

This will configure a default profile which will be sufficient for most users.

See the Amazon document on
[Named Profiles](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) to add access to multiple
S3 buckets or to an AWS Elastic Container Registry.

## Available Scripts

### Running in Development

In the project directory, you can run:

#### `npm start`

> Note: To avoid browser tabs from being opened automatically every time the frontend is launched, set
> [`BROWSER=none`](https://create-react-app.dev/docs/advanced-configuration/) environment variable.

Installs the necessary packages and runs the app in the development mode.<br> Open
[http://localhost:3000](http://localhost:3000) to view it in the browser.

#### `npm run frontend`

Runs only the front end of the app in the development mode.

> Note: The frontend automatically recompiles if your make frontend edits. You will also see any lint errors in the
> console.

#### `npm run backend`

Runs only the backend.

> Note: If you make backend edits, the backend will _not_ recompile—you need to rerun `npm start` or `npm run backend`.

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

To browse the auto-generated OpenAPI UI, browse to [http://localhost:5000/openapi](http://localhost:5000/openapi).<br>

#### Regenerate OpenAPI bindings for frontend

First, you must install the Java Runtime Environment (JRE) 8 or newer as mentioned in the
[`openapi-generator` README](https://github.com/OpenAPITools/openapi-generator#13---download-jar).

- For Windows: https://www.microsoft.com/openjdk
- For Ubuntu: `sudo apt install default-jre`
- For macOS: `brew install adoptopenjdk`

After that, run the following script to regenerate the frontend OpenAPI bindings in place:

```
(venv) $ python scripts/generate_openapi.py
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

### `npm run lint:fix-layout`

Run ESLint and apply `suggestion` and `layout` fixes automatically. This will sort and group imports.

#### `npm run fmt-frontend`

Auto-format frontend code in the `src` folder.

### Import Semantic Domains

Imports Semantic Domains from the provided xml file.

```bash
$ npm run import-sem-doms -- <XML_FILE_PATH>
```

### Generate License Reports

To generate a summary of licenses used in production

```bash
$ npm run license-summary-backend
$ npm run license-summary-frontend
```

To generate a full report of the licenses used in production that is included in the user guide:

```bash
$ npm run license-report-backend
$ npm run license-report-frontend
```

> Note: This should be performed each time production dependencies are changed.

### Set Project Version

To update the version of the project:

1. Edit package.json `"version"` to a [semantic versioning](https://docs.npmjs.com/about-semantic-versioning) compatible
   string (e.g. `"0.1.1-alpha.0"`).
2. Run `npm install` to automatically update `package-lock.json`.

To retrieve the current version of the project from the terminal:

```bash
$ npm run --silent version
```

### Inspect Database

To browse the database locally during development, open MongoDB Compass Community.

1. Under New Connection, enter `mongodb://localhost:27017`
2. Under Databases, select CombineDatabase

### Cleanup Local Repository

It's sometimes possible for a developer's local temporary state to get out of sync with other developers or CI. This
script removes temporary files and packages while leaving database data intact. This can help troubleshoot certain types
of development setup errors.

```bash
# On Windows, use `py` instead of `python3`.
$ python3 scripts/cleanup_local_repo.py
```

## Maintenance Scripts for TheCombine

The maintenance scripts enable certain maintenance tasks on your instance of _TheCombine_. _TheCombine_ may be running
in one of three environments:

1. _Development Environment_ - To run _TheCombine_ in the development environment, run `npm start` from the project
   directory. Unless specified otherwise, each of the maintenance commands are to be run from the project directory.
2. _In Local Docker Containers_ - To run _TheCombine_ from your software development project inside Docker containers
   see the [Docker](#docker) section. Unless specified otherwise, each of the maintenance commands are to be run from
   the project directory. Python scripts must be run in the virtual environment.
3. _Production Environment_ - The [How To Deploy TheCombine](docs/deploy/README.md) Document describes how to configure
   a production machine and install _TheCombine_ on it. For each of the commands below, use `ssh` to connect to the
   target system where _TheCombine_ is running and run the following commands to set the user and working directory:

   ```bash
   sudo su -l combine
   cd /opt/combine
   ```

   Unless specified otherwise, each of the maintenance commands are to be run from `/opt/combine/bin`

The descriptions of each of the maintenance tasks below provide instructions for completing the task in each of the
environments. Any of the Python scripts can be run with the `--help` option to see more usage options.

### Add a User to a Project

Task: add an existing user to a project

| Environment     | Command                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| Development     | _Not Available_                                                                                                    |
| Local Container | `(venv)$ python deploy/roles/combine_maintenance/files/add_user_to_proj.py --project <PROJECT_NAME> --user <USER>` |
| Production      | `$ bin/add_user_to_proj.py --project <PROJECT_NAME> --user <USER>`                                                 |

Notes:

1. The `--project` and `--user` options may be shortened to `--p` and `--u` respectively.
2. The user is added to the project with normal project member permissions (`[3,2,1]`). Add the `--admin` option to add
   the user with project administrator permissions (`[5,4,3,2,1]`)

### Backup _TheCombine_

Task: Backup the CombineDatabase and the Backend files to the Amazon Simple Storage Service (S3).

| Environment     | Command                                                                   |
| --------------- | ------------------------------------------------------------------------- |
| Development     | _Not Available_                                                           |
| Local Container | `(venv)$ python deploy/roles/combine_maintenance/files/combine_backup.py` |
| Production      | `$ bin/combine_backup.py`                                                 |

Notes:

1. The backup script requires that the `aws-cli` version 2 is installed. The [Amazon Web Services](#amazon-web-services)
   section describes how to install and configure `aws-cli`.
2. The backup script can be run from any directory.
3. The backup script is configured using `script_conf.json` in the same directory as the script. You may edit this file
   to change the configuration, such as, to use a different AWS S3 bucket, or a different hostname (the hostname is used
   to tag the backup)
4. The daily backup job on the server will also clean up old backup for the machine that is being backed up. This is not
   part of `combine_backup.py`; backups made with this script must be managed manually. See the
   [AWS CLI Command Reference (s3)](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/index.html)
   for documentation on how to use the command line to list and to manage the backup objects.

### Create a New Admin User

Task: create a new user who is a site administrator

| Environment     | Command                                                                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Development     | set/export `COMBINE_ADMIN_PASSWORD`<br>set/export `COMBINE_ADMIN_EMAIL`<br>`$ cd Backend`<br>`$ dotnet run create-admin-username=admin`              |
| Local Container | `$ docker-compose run -e COMBINE_ADMIN_USERNAME=<USER_NAME> -e COMBINE_ADMIN_PASSWORD="<PASSWORD>" -e COMBINE_ADMIN_EMAIL="<EMAIL_ADDRESS>" backend` |
| Production      | `$ ansible-playbook playbook_install --limit <target_name> -u sillsdev -K`<br>Run from the `deploy` directory in the project on the host machine     |

### Delete a Project

Task: Delete a project

| Environment     | Command                                                                              |
| --------------- | ------------------------------------------------------------------------------------ |
| Development     | _Not Available_                                                                      |
| Local Container | `(venv)$ python deploy/roles/combine_maintenance/files/rm_project.py <PROJECT_NAME>` |
| Production      | `$ bin/rm_project.py <PROJECT_NAME>`                                                 |

You may specify more than one `<PROJECT_NAME>` to delete multiple projects.

### Drop Database

Task: completely erase the current Mongo database

| Environment                   | Command                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------- |
| Development                   | `$ npm run drop-database`                                                       |
| Local Container or Production | `$ docker-compose exec database mongo CombineDatabase --eval db.dropDatabase()` |

### Grant Admin Rights

Task: grant admin rights for an existing user

| Environment     | Command                                                                                |
| --------------- | -------------------------------------------------------------------------------------- |
| Development     | `$ npm run set-admin-user -- <USERNAME>` <br> _Note the_ `--` \_before the user name\_ |
| Local Container | `(venv)$ python deploy/roles/combine_maintenance/files/make_user_admin.py <USERNAME>`  |
| Production      | `$ bin/make_user_admin.py <USERNAME>`                                                  |

You may specify more than one `<USER_NAME>` to update multiple users.

### Restore _TheCombine_

Task: Restore the CombineDatabase and the Backend files from a backup stored on the Amazon Simple Storage Service (S3).

| Environment     | Command                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------- |
| Development     | _Not Available_                                                                          |
| Local Container | `(venv)$ python deploy/roles/combine_maintenance/files/combine_restore.py [BACKUP_NAME]` |
| Production      | `$ bin/combine_restore.py [BACKUP_NAME]`                                                 |

Notes:

1. The restore script requires that the `aws-cli` version 2 is installed. The
   [Amazon Web Services](#amazon-web-services) section describes how to install and configure `aws-cli`.
2. The restore script can be run from any directory.
3. The restore script is configured using `script_conf.json` in the same directory as the script.
4. The restore script takes an optional backup name. This is the name of the backup in the AWS S3 bucket, not a local
   file. If the backup name is not provided, the restore script will list the available backups and allow you to choose
   one for the restore operation.

## User Guide

The User Guide found at https://sillsdev.github.io/TheCombine is automatically built from the `master` branch.

To locally build the user guide and serve it dynamically (automatically reloading on change), run the following from
your Python virtual environment:

```bash
(venv) $ tox -e user-guide-serve
```

To locally build the user guide statically into `docs/user-guide/site`:

```bash
(venv) $ tox -e user-guide
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

### Backend (C# + ASP<area>.NET)

- [C#](https://www.w3schools.com/cs/default.asp)
- [Our style guide](docs/style_guide/c_sharp_style_guide.md)
- [ASP.NET](https://docs.microsoft.com/en-us/aspnet/core/getting-started/?view=aspnetcore-5.0)
- [NUnit](https://docs.nunit.org/articles/nunit/intro.html) (unit testing)

### Frontend (Typescript + React + Redux)

- [JS](https://www.w3schools.com/js/default.asp)
- [TS](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [Our style guide](docs/style_guide/ts_style_guide.md)
- [React](https://reactjs.org/)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [Redux concepts](https://redux.js.org/tutorials/fundamentals/part-2-concepts-data-flow)
- [Redux tutorials](https://redux.js.org/tutorials/typescript-quick-start)
- [React-Localize-Redux](https://ryandrewjohnson.github.io/react-localize-redux/) (text localization)
- [Jest](https://jestjs.io/docs/getting-started) (unit testing)
- [React-Test-Renderer](https://reactjs.org/docs/test-renderer.html) (unit testing)
