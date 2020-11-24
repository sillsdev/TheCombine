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
          <Route component={PageNotFound} />
        </Switch>
      </div>
    );
  }
}
