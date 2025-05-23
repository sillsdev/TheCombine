import loadable from "@loadable/component";
import { RouteObject } from "react-router-dom";

import LandingPage from "components/LandingPage";
import Login from "components/Login/Login";
import ProjectInvite from "components/Login/ProjectInvite";
import Signup from "components/Login/Signup";
import PageNotFound from "components/PageNotFound/component";
import PasswordRequest from "components/PasswordReset/Request";
import PasswordReset from "components/PasswordReset/ResetPage";
import RequireAuth from "components/RequireAuth";
import { Path } from "types/path";
import { routerPath } from "utilities/pathUtilities";
import DownBrace from "components/TreeView/TreeDepiction/DownBrace";

const AppWithBar = loadable(() => import("components/App/AppLoggedIn"));

export const appRoutes: RouteObject[] = [
  {
    path: Path.Root,
    element: <LandingPage />,
  },
  {
    // use routerPath to get the wildcard expression for the app pages
    path: routerPath(Path.AppRoot),
    element: (
      <RequireAuth redirectTo={Path.Login}>
        <AppWithBar />
      </RequireAuth>
    ),
  },
  {
    path: Path.Login,
    element: <Login />,
  },
  {
    path: Path.Signup,
    element: <Signup />,
  },
  {
    path: `${Path.PwReset}/:token`,
    element: <PasswordReset />,
  },
  {
    path: Path.PwRequest,
    element: <PasswordRequest />,
  },
  {
    path: `${Path.ProjInvite}/:project/:token`,
    element: <ProjectInvite />,
  },
  {
    path: "brace",
    element: (
      <DownBrace backgroundColor="red" color="blue" height={200} width={940} />
    ),
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
];
