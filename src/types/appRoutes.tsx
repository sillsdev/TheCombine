import loadable from "@loadable/component";
import { RouteObject } from "react-router-dom";

import LandingPage from "components/LandingPage";
import Login from "components/Login/LoginPage";
import SignUp from "components/Login/SignUpPage";
import PageNotFound from "components/PageNotFound/component";
import PasswordRequest from "components/PasswordReset/Request";
import PasswordReset from "components/PasswordReset/ResetPage";
import ProjectInvite from "components/ProjectInvite/ProjectInvite";
import RequireAuth from "components/RequireAuth";
import { Path } from "types/path";
import { routerPath } from "utilities/pathUtilities";

const AppWithBar = loadable(() => import("components/App/AppLoggedIn"));

export const appRoutes: RouteObject[] = [
  {
    path: routerPath(Path.Root),
    element: <LandingPage />,
  },
  {
    path: routerPath(Path.AppRoot),
    element: (
      <RequireAuth redirectTo={routerPath(Path.Login)}>
        <AppWithBar />
      </RequireAuth>
    ),
  },
  {
    path: routerPath(Path.Login),
    element: <Login />,
  },
  {
    path: routerPath(Path.SignUp),
    element: <SignUp />,
  },
  {
    path: `${routerPath(Path.PwReset)}/:token`,
    element: <PasswordReset />,
  },
  {
    path: routerPath(Path.PwRequest),
    element: <PasswordRequest />,
  },
  {
    path: `${routerPath(Path.ProjInvite)}/:project/:token`,
    element: <ProjectInvite />,
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
];
