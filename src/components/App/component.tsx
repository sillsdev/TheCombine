//external modules
import React from "react";

//TC modules
import ProjectScreen from "../ProjectScreen/ProjectScreenComponent";
import { Route, Switch } from "react-router-dom";
import { PrivateRoute } from "../PrivateRoute";
import Login from "../Login/LoginPage";
import Register from "../Login/RegisterPage";
import PasswordReset from "../PasswordReset/ResetPage";
import ResetRequest from "../PasswordReset/RequestPage";
import PageNotFound from "../PageNotFound/component";
import { GoalRoute } from "../GoalRoute/component";
import DataEntry from "../DataEntry";
import ProjectSettings from "../ProjectSettings";
import UserSettings from "../UserSettings/UserSettings";

/**
 * The top-level component
 */
export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Switch>
          <PrivateRoute exact path="/" component={ProjectScreen} />
          <PrivateRoute exact path="/data-entry" component={DataEntry} />
          <PrivateRoute exact path="/user-settings" component={UserSettings} />
          <PrivateRoute
            exact
            path="/project-settings"
            component={ProjectSettings}
          />
          <PrivateRoute path="/goals" component={GoalRoute} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/forgot/reset/:token" component={PasswordReset} />
          <Route path="/forgot/reset/" component={PasswordReset} />
          <Route path="/forgot/request" component={ResetRequest} />
          <Route component={PageNotFound} />
        </Switch>
      </div>
    );
  }
}
