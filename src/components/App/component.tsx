//external modules
import React from "react";
import { Route, Switch } from "react-router-dom";

//TC modules
import { path } from "../../history";
import Login from "../Login/LoginPage";
import Register from "../Login/RegisterPage";
import PageNotFound from "../PageNotFound/component";
import PasswordReset from "../PasswordReset/ResetPage";
import ResetRequest from "../PasswordReset/RequestPage";
import PrivateRoute from "../PrivateRoute";
import ProjectInvite from "../ProjectInvite";
import AppWithBar from "./AppLoggedIn";

/**
 * The top-level component
 */
export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Switch>
          <PrivateRoute path={path.projScreen} component={AppWithBar} />
          <Route path={path.login} component={Login} />
          <Route path={path.register} component={Register} />
          <Route path={`${path.pwReset}/:token`} component={PasswordReset} />
          <Route path={path.pwRequest} component={ResetRequest} />
          <Route
            path={`${path.projInvite}/:project/:token`}
            component={ProjectInvite}
          />
          <Route component={PageNotFound} />
        </Switch>
      </div>
    );
  }
}
