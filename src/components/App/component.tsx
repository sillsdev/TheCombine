import loadable from "@loadable/component";
import { ReactElement, Suspense, useEffect } from "react";
import { Route, Switch } from "react-router-dom";

import { Path } from "browserHistory";
import AnnouncementBanner from "components/AnnouncementBanner/AnnouncementBanner";
import LandingPage from "components/LandingPage";
import Login from "components/Login/LoginPage";
import SignUp from "components/Login/SignUpPage";
import PageNotFound from "components/PageNotFound/component";
import ResetRequest from "components/PasswordReset/RequestPage";
import PasswordReset from "components/PasswordReset/ResetPage";
import PrivateRoute from "components/PrivateRoute";
import ProjectInvite from "components/ProjectInvite";
import i18n from "i18n";

const AppWithBar = loadable(() => import("components/App/AppLoggedIn"));

/**
 * The top-level component
 */
export default function App(): ReactElement {
  useEffect(() => {
    document.body.dir = i18n.dir();
  }, []);

  return (
    <div className="App">
      <Suspense fallback={<div />}>
        <AnnouncementBanner />
        <Switch>
          <Route exact path={Path.Root} component={LandingPage} />
          <PrivateRoute path={Path.ProjScreen} component={AppWithBar} />
          <Route path={Path.Login} component={Login} />
          <Route path={Path.SignUp} component={SignUp} />
          <Route path={`${Path.PwReset}/:token`} component={PasswordReset} />
          <Route path={Path.PwRequest} component={ResetRequest} />
          <Route
            path={`${Path.ProjInvite}/:project/:token`}
            component={ProjectInvite}
          />
          <Route component={PageNotFound} />
        </Switch>
      </Suspense>
    </div>
  );
}
