import loadable from "@loadable/component";
import React from "react";
import { Route, Switch } from "react-router-dom";

import { Path } from "browserHistory";
import LandingPage from "components/LandingPage";
import Login from "components/Login/LoginPage";
import Register from "components/Login/RegisterPage";
import PageNotFound from "components/PageNotFound/component";
import PasswordReset from "components/PasswordReset/ResetPage";
import ResetRequest from "components/PasswordReset/RequestPage";
import PrivateRoute from "components/PrivateRoute";
import ProjectInvite from "components/ProjectInvite";

const AppWithBar = loadable(() => import("components/App/AppLoggedIn"));

/**
 * The top-level component
 */
export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Switch>
          <Route exact path={Path.Root} component={LandingPage} />
          <PrivateRoute path={Path.ProjScreen} component={AppWithBar} />
          <Route path={Path.Login} component={Login} />
          <Route path={Path.Register} component={Register} />
          <Route path={`${Path.PwReset}/:token`} component={PasswordReset} />
          <Route path={Path.PwRequest} component={ResetRequest} />
          <Route
            path={`${Path.ProjInvite}/:project/:token`}
            component={ProjectInvite}
          />
          <Route component={PageNotFound} />
        </Switch>
      </div>
    );
  }
}
