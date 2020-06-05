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
   - [MongoDB Server](https://www.mongodb.com/download-center/community) and add
     /bin to PATH Environment Variable
     - On Windows, if using [Chocolatey][chocolatey]: `choco install mongodb`
     - On Ubuntu 18.04:
        ```bash
        $ sudo apt install mongodb

        # Disable Mongo from starting system-wide.
        $ sudo systemctl disable mongodb
        $ sudo systemctl stop mongodb
        ```
   - [VS Code](https://code.visualstudio.com/download) and Prettier code
     formatting extension
   - [dotnet-format](https://github.com/dotnet/format):
     `dotnet tool install -g dotnet-format --version 3.3.111304`
3. (Windows Only) Run `dotnet dev-certs https` and `dotnet dev-certs https --trust` to
   generate and trust an SSL certificate
4. Set the environment variable `ASPNETCORE_JWT_SECRET_KEY` to a string
   **containing at least 16 characters**, such as _This is a secret key_. Set
   it in your `.profile` (Linux) or the _System_ app (Windows).
5. (VS Code Users Only) Enable automatic formatting on save.
   - **File** | **Preferences** | **Settings** | Search for **formatOnSave** and
     check the box.
6. Run `npm start` from the project directory to install dependencies and start
   the project

[chocolatey]: https://chocolatey.org/

## Available Scripts

In the project directory, you can run:

## `npm start`

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

## `npm test`

Launches the test runners in the interactive watch mode.<br>
See the section about
[running tests](https://facebook.github.io/create-react-app/docs/running-tests)
for more information.

#### `npm run coverage`

Launches the test runners to calculate the test coverage of the front and
back ends of the app.

## `npm run dotnet-format`

Automatically format the C# source files in the backend.

## `npm run lint`

Runs ESLint on the codebase to detect code problems that should be fixed.

## `npm run prettier`

Auto-format frontend code in the `src` folder.

## `npm run build`

Builds the app for production to the `build` folder.

It correctly bundles React in production mode and optimizes the build for the
best performance.

The build is minified and the filenames include the hashes.

Your app is ready to be deployed!

See the section about
[deployment](https://facebook.github.io/create-react-app/docs/deployment) for
more information.

## Drop Database

To completely erase the current Mongo database, run:

```batch
> npm run drop-database
```

## Create Database Admin User

To grant a user database administrator rights (all permissions for all
database objects), create a user normally and then execute:

```batch
# Note the -- before the user name.
> npm run set-admin-user -- <USER_NAME>
```

## Features

TODO

## Learn More

- [React](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [React-Redux](https://redux.js.org/basics/usage-with-react)
- [React-Localize-Redux](https://ryandrewjohnson.github.io/react-localize-redux/)
  (Language Localization)
- [ASP.NET](https://docs.microsoft.com/en-us/aspnet/core/getting-started/?view=aspnetcore-2.2)
