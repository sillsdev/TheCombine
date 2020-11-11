//external modules
import React from "react";
import { Route, Switch } from "react-router-dom";

//TC modules
import { path } from "../../history";
import DataEntry from "../DataEntry";
import GoalRoute from "../GoalRoute/component";
import Login from "../Login/LoginPage";
import Register from "../Login/RegisterPage";
import PageNotFound from "../PageNotFound/component";
import PasswordReset from "../PasswordReset/ResetPage";
import ResetRequest from "../PasswordReset/RequestPage";
import PrivateRoute from "../PrivateRoute";
import ProjectInvite from "../ProjectInvite";
import ProjectScreen from "../ProjectScreen/ProjectScreenComponent";
import ProjectSettings from "../ProjectSettings";
import SiteSettings from "../SiteSettings/SiteSettingsComponent";
import UserSettings from "../UserSettings/UserSettings";

/**
 * The top-level component
 */
export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Switch>
          <PrivateRoute
            exact
            path={path.projScreen}
            component={ProjectScreen}
          />
          <PrivateRoute exact path={path.dataEntry} component={DataEntry} />
          <PrivateRoute
            exact
            path={path.projSettings}
            component={ProjectSettings}
          />
          <PrivateRoute
            exact
            path={path.siteSettings}
            component={SiteSettings}
          />
          <PrivateRoute
            exact
            path={path.userSettings}
            component={UserSettings}
          />
          <PrivateRoute path={path.goals} component={GoalRoute} />
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
