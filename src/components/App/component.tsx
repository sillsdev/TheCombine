import loadable from "@loadable/component";
import { ReactElement, Suspense } from "react";
import { Route, Switch } from "react-router-dom";

import { Path } from "browserHistory";
import AnnouncementBanner from "components/AnnouncementBanner/AnnouncementBanner";
import LandingPage from "components/LandingPage";
import Login from "components/Login/LoginPage";
import SignUp from "components/Login/SignUpPage";
import PageNotFound from "components/PageNotFound/component";
import PasswordRequest from "components/PasswordReset/Request";
import PasswordReset from "components/PasswordReset/ResetPage";
import PrivateRoute from "components/PrivateRoute";
import ProjectInvite from "components/ProjectInvite";

const AppWithBar = loadable(() => import("components/App/AppLoggedIn"));

/**
 * The top-level component
 */
export default function App(): ReactElement {
  return (
    <div className="App">
      <Suspense fallback={<div />}>
        <AnnouncementBanner />
        <Switch>
          <Route exact path={Path.Root}>
            <LandingPage />
          </Route>
          <PrivateRoute path={Path.ProjScreen}>
            <AppWithBar />
          </PrivateRoute>
          <Route path={Path.Login}>
            <Login />
          </Route>
          <Route path={Path.SignUp}>
            <SignUp />
          </Route>
          <Route path={`${Path.PwReset}/:token`}>
            <PasswordReset />
          </Route>
          <Route path={Path.PwRequest}>
            <PasswordRequest />
          </Route>
          <Route path={`${Path.ProjInvite}/:project/:token`}>
            <ProjectInvite />
          </Route>
          <Route>
            <PageNotFound />
          </Route>
        </Switch>
      </Suspense>
    </div>
  );
}
