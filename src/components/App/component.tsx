//external modules
import React from "react";
import { Route, Switch } from "react-router-dom";

//TC modules
import DataEntry from "../DataEntry";
import { GoalRoute } from "../GoalRoute/component";
import Login from "../Login/LoginPage";
import Register from "../Login/RegisterPage";
import PasswordReset from "../PasswordReset/ResetPage";
import ResetRequest from "../PasswordReset/RequestPage";
import PageNotFound from "../PageNotFound/component";
import { PrivateRoute } from "../PrivateRoute";
import ProjectSettings from "../ProjectSettings";
import ProjectScreen from "../ProjectScreen/ProjectScreenComponent";
import SiteSettings from "../SiteSettings/SiteSettingsComponent";
import UserSettings from "../UserSettings/UserSettings";
import ProjectInvite from "../ProjectInvite";

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
          <PrivateRoute
            exact
            path="/project-settings"
            component={ProjectSettings}
          />
          <PrivateRoute exact path="/site-settings" component={SiteSettings} />
          <PrivateRoute exact path="/user-settings" component={UserSettings} />
          <PrivateRoute path="/goals" component={GoalRoute} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/forgot/reset/:token" component={PasswordReset} />
          <Route path="/forgot/request" component={ResetRequest} />
          <Route path="/invite/:project/:token" component={ProjectInvite} />
          <Route component={PageNotFound} />
        </Switch>
      </div>
    );
  }
}
