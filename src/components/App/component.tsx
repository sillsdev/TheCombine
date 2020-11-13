//external modules
import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

//TC modules
import { Path } from "../../history";
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
          <Route exact path={Path.root}>
            <Redirect to={Path.projScreen} />
          </Route>
          <PrivateRoute path={Path.projScreen} component={AppWithBar} />
          <Route path={Path.login} component={Login} />
          <Route path={Path.register} component={Register} />
          <Route path={`${Path.pwReset}/:token`} component={PasswordReset} />
          <Route path={Path.pwRequest} component={ResetRequest} />
          <Route
            path={`${Path.projInvite}/:project/:token`}
            component={ProjectInvite}
          />
          <Route component={PageNotFound} />
        </Switch>
      </div>
    );
  }
}
