# The Combine

[![Frontend Actions Status][github-actions-frontend-badge]][github-actions]
[![Frontend Coverage][frontend-codecov-badge]][codecov]
[![Backend Actions Status][github-actions-backend-badge]][github-actions]
[![Backend Coverage][backend-codecov-badge]][codecov]
[![Language grade: JavaScript][lgtm-js-badge]][lgtm-js]
[![Total alerts][lgtm-alerts-badge]][lgtm-alerts]
[![Python Actions Status][github-actions-python-badge]][github-actions]
[![GitHub release][github-version-badge]][github-version]
![Localization][localization-badge]
[![GitHub][github-license-badge]][github-license]
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
[github-version]: https://github.com/sillsdev/TheCombine/releases
[github-license-badge]: https://img.shields.io/github/license/sillsdev/TheCombine
[github-license]: https://github.com/sillsdev/TheCombine/blob/master/LICENSE
[github-contribs-badge]: https://img.shields.io/github/contributors/sillsdev/TheCombine?cacheSeconds=10000
[github-contribs]: https://github.com/sillsdev/TheCombine/graphs/contributors

A rapid word collection tool.

## Getting Started with Development

1. Clone this repo:

   ```bash
   # The `--recurse-submodules` is used to fetch many of the Ansible roles used
   # by the Ansible playbooks in the deploy folder.
   $ git clone --recurse-submodules https://github.com/sillsdev/TheCombine.git
   ```

   If you've already cloned the repo without `--recurse-submodules`, run:

   ```bash
   $ git submodule update --init --recursive
   ```

2. Install:
   - [Node.js 12 (LTS)](https://nodejs.org/en/download/)
     - On Windows, if using [Chocolatey][chocolatey]: `choco install nodejs-lts`
     - On Ubuntu, follow
       [this guide](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions)
       using the appropriate Node.js version.
   - [.NET Core SDK 3.1 (LTS)](https://dotnet.microsoft.com/download/dotnet-core/3.1)
     - On Ubuntu 18.04, follow these
       [instructions](https://docs.microsoft.com/en-us/dotnet/core/install/linux-package-manager-ubuntu-1804).
   - [MongoDB](https://docs.mongodb.com/manual/administration/install-community/) and add
     /bin to PATH Environment Variable
     - On Windows, if using [Chocolatey][chocolatey]: `choco install mongodb`
   - [VS Code](https://code.visualstudio.com/download) and Prettier code
     formatting extension
   - [dotnet-format](https://github.com/dotnet/format):
     `dotnet tool update --global dotnet-format --version 4.1.131201`
   - [dotnet-reportgenerator](https://github.com/danielpalme/ReportGenerator)
     `dotnet tool update --global dotnet-reportgenerator-globaltool --version 4.6.1`
3. (Windows Only) Run `dotnet dev-certs https` and `dotnet dev-certs https --trust` to
   generate and trust an SSL certificate
4. Set the environment variable `COMBINE_JWT_SECRET_KEY` to a string
   **containing at least 16 characters**, such as _This is a secret key_. Set
   it in your `.profile` (Linux or Mac 10.14-), your `.zprofile` (Mac 10.15+), or the _System_ app (Windows).
5. If you want the email services to work you will need to set the following environment variables.
   These values must be kept secret, so ask your email administrator to supply them.

   - `COMBINE_SMTP_SERVER`
   - `COMBINE_SMTP_PORT`
   - `COMBINE_SMTP_USERNAME`
   - `COMBINE_SMTP_PASSWORD`
   - `COMBINE_SMTP_ADDRESS`
   - `COMBINE_SMTP_FROM`

6. (VS Code Users Only) Enable automatic formatting on save.
   - **File** | **Preferences** | **Settings** | Search for **formatOnSave** and
     check the box.
7. Run `npm start` from the project directory to install dependencies and start
   the project.

8. Consult our [C#](docs/c_sharp_style_guide.md)
   and [JavaScript/TypeScript](docs/ts_style_guide.md)
   style guides for best coding practices in this project.

[chocolatey]: https://chocolatey.org/

## Available Scripts

In the project directory, you can run:

### `npm start`

> Note: To avoid browser tabs from being opened automatically every time the frontend is launched, set
> [`BROWSER=none`](https://create-react-app.dev/docs/advanced-configuration/) environment variable.

Installs the necessary packages and runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

> Note: You may need to first browse to https://localhost:5001 and accept the
> certificate warning in your browser if you get Network Errors the first time
> you try to run the application locally.

#### `npm run frontend`

Runs only the front end of the app in the development mode.

#### `npm run api`

Runs only the API.

#### `npm run database`

Runs only the mongo database.

### `npm test`

Run all backend and frontend tests.

#### `npm run test-backend`

Run all backend unit tests.

To run a subset of tests, use the
[`--filter`](https://docs.microsoft.com/en-us/dotnet/core/testing/selective-unit-tests?pivots=nunit)
option.

```bash
# Note the extra -- needed to separate arguments for npm vs script.
$ npm run test-backend -- --filter FullyQualifiedName~Backend.Tests.Models.ProjectTests
```

#### `npm run test-frontend`

Launches the test runners in the interactive watch mode.<br>
See the section about
[running tests](https://facebook.github.io/create-react-app/docs/running-tests)
for more information.

To run a subset of tests, pass in the name of a partial file path to filter:

```bash
# Note the extra -- needed to separate arguments for npm vs script.
$ npm run test-frontend -- DataEntry
```

#### `npm run test-*:coverage`

Launches the test runners to calculate the test coverage of the frontend or
backend of the app.

##### Frontend Code Coverage Report

Run:

```bash
$ npm run test-frontend:coverage
```

To view the frontend code coverage open `coverage/lcov-report/index.html`
in a browser.

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

### `npm run fmt-backend`

Automatically format the C# source files in the backend.

### `npm run lint`

Runs ESLint on the codebase to detect code problems that should be fixed.

### `npm run fmt-frontend`

Auto-format frontend code in the `src` folder.

### `npm run build`

Builds the app for production to the `build` folder.

It correctly bundles React in production mode and optimizes the build for the
best performance.

The build is minified and the filenames include the hashes.

Your app is ready to be deployed!

See the section about
[deployment](https://facebook.github.io/create-react-app/docs/deployment) for
more information.

### `npm run import-sem-doms`

Imports Semantic Domains from the provided xml file.

```bash
$ npm run import-sem-doms -- <XML_FILE_PATH>
```

## Database

### Inspect Database

To browse the database locally during development, open MongoDB Compass Community.

1. Under New Connection, enter `mongodb://localhost:27017`
2. Under Databases, select CombineDatabase

### Drop Database

To completely erase the current Mongo database, run:

```bash
$ npm run drop-database
```

### Create Database Admin User

### Create a New Admin User

#### Local

To create a new admin user, first set the `COMBINE_ADMIN_PASSWORD`
environment variable and then run:

```bash
$ cd Backend
$ dotnet run create-admin-username=admin
```

The exit code will be set to `0` on success and non-`0` otherwise.

### (Development Only) Grant an Existing User Admin Rights

To grant an _existing_ user database administrator rights (all permissions for
all database objects), create a user normally and then execute:

```bash
# Note the -- before the user name.
$ npm run set-admin-user -- <USERNAME>
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

1. Edit package.json `"version"` to a
   [semantic versioning](https://docs.npmjs.com/about-semantic-versioning)
   compatible string (e.g. `"0.1.1-alpha.0"`).
2. Run `npm install` to automatically update `package-lock.json`.

To retrieve the current version of the project from the terminal:

```bash
$ npm run --silent version
```

## Docker

### Requirements

#### Docker

Install [Docker](https://docs.docker.com/get-docker/).

(Linux Only) Install [Docker Compose](https://docs.docker.com/compose/install/)
separately. This is included by default in Docker Desktop for Windows and macOS.

#### Python

A Python script, `scripts/docker_setup.py` is used to configure the files needed to run
_TheCombine_ in Docker containers.

##### Windows Only

- Navigate to the [Python 3.8.5 Downloads](https://www.python.org/downloads/release/python-385/) page.

- Download and run the appropriate installer - it is most likely the installer labeled
  _Windows x86-64 executable installer_

- Once Python is installed, create an isolated Python
  [virtual environment](https://docs.python.org/3/library/venv.html) using the
  [`py`](https://docs.python.org/3/using/windows.html#getting-started) launcher
  installed globally into the `PATH`.

  ```bash
  $ py -m venv venv
  $ venv\Scripts\activate
  ```

##### Linux Only

To install Python 3 on Ubuntu, run the following commands:

```bash
$ sudo apt update
$ sudo apt install python3 python3-venv
```

Create an isolated Python virtual environment

```bash
$ python3 -m venv venv
$ source venv/bin/activate
```

##### Python Packages

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

To upgrade all pinned dependencies, run the following command under Python 3.6 so the
requirements are backwards-compatible.

```bash
(venv) $ pip-compile --upgrade dev-requirements.in
```

Then manually remove `dataclasses==` line from `dev-requirements.txt`. This is to work
around a pinning issue with supporting Python 3.6 and 3.7+.

#### Configure Docker

Run the configuration script in an activated virtual environment to generate
the necessary configuration files.

```bash
(venv) $ python scripts/docker_setup.py

# To view options, run with --help
```

### Build and Run

For information on _Docker Compose_ see the
[Docker Compose documentation](https://docs.docker.com/compose/).

#### Running In Docker

1. Create the required docker files by running `docker_setup.py` from _TheCombine_'s project directory.

2. The `docker_setup.py` will generate a file, `.env.backend`, that defines
   the environment variables needed by the Backend container. If you have defined
   them as OS variables in the [Getting Started with Development](#getting-started-with-development)
   section above, then these variables will already be set. If not, then you will need to edit
   `.env.backend` and provide values for the variables that are listed.

3. Build the images for the Docker containers

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

7. To stop and remove any stored data:

   ```bash
   $ docker-compose down --volumes
   ```

### Create a New Admin User (Docker Environment)

Edit `.env.backend` as follows:

    * Fill in the environment variables.
    * Add the following environment variables and assign values to them:
        - COMBINE_ADMIN_USERNAME
        - COMBINE_ADMIN_PASSWORD
    * Set the file permissions so that only you have read or write access.

Run the following command to install the admin user in the _CombineDatabase_:

```bash
$ docker-compose up --abort-on-container-exit
```

This will create the user and exit. If successful, the exit code will be `0`,
otherwise an error will be logged and the exit code will be non-`0`.

**Important**: Remove the `COMBINE_ADMIN_*` environment variables from
`.env.backend` so that subsequent launches will start up the backend.

### Production

The process for configuring and deploying _TheCombine_ for production targets is
described in ./docs/docker_deploy/README.md

## Learn More

- [React](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [React-Redux](https://redux.js.org/basics/usage-with-react)
- [React-Localize-Redux](https://ryandrewjohnson.github.io/react-localize-redux/)
  (Language Localization)
- [ASP.NET](https://docs.microsoft.com/en-us/aspnet/core/getting-started/?view=aspnetcore-3.1)
