import React from "react";
import { Link, Redirect, Route, Switch } from "react-router-dom";

import { Path } from "browserHistory";
import Login from "components/Login/LoginPage";
import Register from "components/Login/RegisterPage";
import PageNotFound from "components/PageNotFound/component";
import PasswordReset from "components/PasswordReset/ResetPage";
import ResetRequest from "components/PasswordReset/RequestPage";
import PrivateRoute from "components/PrivateRoute";
import ProjectInvite from "components/ProjectInvite";
import AppWithBar from "components/App/AppLoggedIn";

/**
 * The top-level component
 */
export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Switch>
          <Route exact path={Path.Root}>
            <Redirect to={Path.ProjScreen} />
          </Route>
          <PrivateRoute path={Path.ProjScreen} component={AppWithBar} />
          <Route path={Path.Login} component={Login} />
          <Route path={Path.Register} component={Register} />
          <Route path={`${Path.PwReset}/:token`} component={PasswordReset} />
          <Route path={Path.PwRequest} component={ResetRequest} />
          <Route
            path={`${Path.ProjInvite}/:project/:token`}
            component={ProjectInvite}
          />
          <Route path={Path.Docs}>
            {/* The use of Link's target prevents a react-router state transition, per
             * https://github.com/ReactTraining/react-router/issues/3109#issuecomment-189782650
             */}
            <Link to={window.location.pathname} target="_self" />
          </Route>
          <Route component={PageNotFound} />
        </Switch>
      </div>
    );
  }
}
