# The Combine

A rapid word collection tool.

## Getting Started with Development

1. Clone this repo:<br>
   `git clone --recurse-submodules https://github.com/sillsdev/TheCombine.git`<br>
   The `--recurse-submodules` is used to fetch many of the Ansible roles used by the Ansible playbooks in the deploy folder. If you've already cloned the repo without `--recurse-submodules`, run<br>
   `git submodule update --init --recursive`<br>
   to pull and initialize them.
2. Install:
   - [Node.js 12 (LTS)](https://nodejs.org/en/)
     - On Windows, if using [Chocolately][chocolately]: `choco install nodejs-lts`
   - [.NET Core SDK 2.1 (LTS)](https://dotnet.microsoft.com/download/dotnet-core/2.1)
   - [MongoDB Server](https://www.mongodb.com/download-center/community) and add /bin to PATH Environment Variable
     - On Windows, if using [Chocolately][chocolately]: `choco install mongodb`
   - [VS Code](https://code.visualstudio.com/download) and Prettier code formatting extension
3. Run `dotnet dev-certs https` and `dotnet dev-certs https --trust` to generate and trust an SSL certificate
4. Set the environment variable `ASPNETCORE_JWT_SECRET_KEY` to a string **containing at least 16 characters**, such as *This is a secret key*. Set it in your `.profile` (Linux) or the *System* app (Windows).
5. Run `npm start` from the project directory to install dependencies and start the project

[chocolately]: https://chocolatey.org/

## Available Scripts

In the project directory, you can run:

## `npm start`

Installs the necessary packages and runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

> Note: You may need to first browse to https://localhost:5001 and accept the certificate warning in your
  browser if you get Network Errors the first time you try to run the application locally.

#### `npm run frontend`

Runs only the front end of the app in the development mode.

#### `npm run api`

Runs only the API

#### `npm run database`

Runs only the mongo database

## `npm test`

Launches the test runners in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run coverage`

Launches the test runners to calculate the test coverage of the front and back ends of the app.

## `npm run lint`

Runs ESLint on the codebase to detect code problems that should be fixed.

## `npm run prettier`

Auto-format frontend code in the `src` folder.

## `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Create Database Admin User

To grant a user database administrator rights (all permissions for all database objects), create a user normally and then
execute:

```batch
> setAdminUser.bat <USER_NAME>
```

## Features

TODO

## Learn More

- [React](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [React-Redux](https://redux.js.org/basics/usage-with-react)
- [React-Localize-Redux](https://ryandrewjohnson.github.io/react-localize-redux/) (Language Localization)
- [ASP.NET](https://docs.microsoft.com/en-us/aspnet/core/getting-started/?view=aspnetcore-2.2)
