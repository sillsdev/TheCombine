# The Combine

A rapid word collection tool.

## Getting Started with Development

1. Clone this repo:

   ```bash
   # The `--recurse-submodules` is used to fetch many of the Ansible roles used
   # by the Ansible playbooks in the deploy folder.
   git clone --recurse-submodules https://github.com/sillsdev/TheCombine.git
   ```

   If you've already cloned the repo without `--recurse-submodules`, run:

   ```bash
   git submodule update --init --recursive
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
   - [MongoDB Server](https://docs.mongodb.com/manual/administration/install-community/) and add
     /bin to PATH Environment Variable
     - On Windows, if using [Chocolatey][chocolatey]: `choco install mongodb`
   - [VS Code](https://code.visualstudio.com/download) and Prettier code
     formatting extension
   - [dotnet-format](https://github.com/dotnet/format):
     `dotnet tool install --global dotnet-format --version 3.3.111304`
   - [dotnet-reportgenerator](https://github.com/danielpalme/ReportGenerator)
     `dotnet tool install --global dotnet-reportgenerator-globaltool --version 4.6.1`
3. (Windows Only) Run `dotnet dev-certs https` and `dotnet dev-certs https --trust` to
   generate and trust an SSL certificate
4. Set the environment variable `COMBINE_JWT_SECRET_KEY` to a string
   **containing at least 16 characters**, such as _This is a secret key_. Set
   it in your `.profile` (Linux) or the _System_ app (Windows).
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
   the project

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

Runs only the API

#### `npm run database`

Runs only the mongo database

### `npm test`

Launches the test runners in the interactive watch mode.<br>
See the section about
[running tests](https://facebook.github.io/create-react-app/docs/running-tests)
for more information.

#### `npm run coverage`

Launches the test runners to calculate the test coverage of the front and
back ends of the app.

##### Frontend Code Coverage Report

To view the frontend code coverage open `coverage/lcov-report/index.html`
in a browser.

##### Backend Code Coverage Report

After `npm run coverage` has run, generate the HTML coverage report:

```batch
> npm run gen-backend-coverage-report
```

Open `coverage-backend/index.html` in a browser.

### `npm run dotnet-format`

Automatically format the C# source files in the backend.

### `npm run lint`

Runs ESLint on the codebase to detect code problems that should be fixed.

### `npm run prettier`

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

## `npm run import-sem-doms`

Imports Semantic Domains from the provided xml file.

```bash
npm run import-sem-doms -- <XML_FILE_PATH>
```

## Drop Database

To completely erase the current Mongo database, run:

```batch
> npm run drop-database
```

### Create Database Admin User

### Create a New Admin User

#### Local

To create a new admin user, first set the `COMBINE_ADMIN_PASSWORD`
environment variable and then run:

```batch
> cd Backend
> dotnet run create-admin-username=admin
```

The exit code will be set to `0` on success and non-`0` otherwise.

### (Development Only) Grant an Existing User Admin Rights

To grant an _existing_ user database administrator rights (all permissions for
all database objects), create a user normally and then execute:

```batch
# Note the -- before the user name.
> npm run set-admin-user -- <USERNAME>
```

### Generate License Report

To generate a summary of licenses used in production:

```batch
> npm run license-summary
```

To generate a full report of the licenses used in production:

```batch
> npm run license-report
```

## Docker

### Requirements

Install [Docker](https://docs.docker.com/get-docker/).

(Linux Only) Install [Docker Compose](https://docs.docker.com/compose/install/)
separately. This is included by default in Docker Desktop for Windows and macOS.

### Build and Run

For more information see the
[Docker Compose docs](https://docs.docker.com/compose/).

Copy `.env.backend.template` to `.env.backend` and fill in the environment
variables. Do not fill in the COMBINE_ADMIN_* variables except to create an admin user; see [Create a New Admin User (Docker Environment)](#create-a-new-admin-user-docker-environment)

```batch
> docker-compose build --parallel
> docker-compose up --detach
```

Browse to https://localhost.

> By default self-signed certificates are included, so you will need to accept
> a warning in the browser.

To view logs:

```batch
> docker-compose logs --follow
```

To stop and remove any stored data:

```batch
> docker-compose down --volumes
```
### Create a New Admin User (Docker Environment)

If you have not already created your .env.backend file (see above), copy `.env.backend.template` to `.env.backend`.  Edit `.env.backend` as follows:
 * Fill in the environment variables.
 * Uncomment and fill in the COMBINE_ADMIN_USERNAME and COMBINE_ADMIN_PASSWORD environment variables.
 * Set the file permissions so that only you have read or write access.

Run the following command to install the admin user in the *CombineDatabase*:

```batch
> docker-compose build --parallel
> docker-compose up --abort-on-container-exit
```

This will create the user and exit. If successful, the exit code will be `0`,
otherwise an error will be logged and the exit code will be non-`0`.

**Important**: Remove the `COMBINE_ADMIN_*` environment variables from
`.env.backend` so that subsequent launches will start up the backend.

### Production

The process for configuring and deploying *TheCombine* for production targets is described in ./docs/docker_deploy/README.md

## Learn More

- [React](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [React-Redux](https://redux.js.org/basics/usage-with-react)
- [React-Localize-Redux](https://ryandrewjohnson.github.io/react-localize-redux/)
  (Language Localization)
- [ASP.NET](https://docs.microsoft.com/en-us/aspnet/core/getting-started/?view=aspnetcore-3.1)
