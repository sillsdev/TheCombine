//external modules
import React from "react";

//TC modules
import CreateProject from "../CreateProject";
import { Route, Switch, Router } from "react-router-dom";
import { PrivateRoute } from "../PrivateRoute";
import { LogoutButton } from "../Login/LogoutButton";
import Login from "../Login";
import { createBrowserHistory } from "history";
import PageNotFound from "../PageNotFound/component";
import { GoalRoute } from "../GoalRoute/component";

export const history = createBrowserHistory();

export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Switch>
          <PrivateRoute exact path="/" component={CreateProject} />
          <PrivateRoute path="/goals" component={GoalRoute} />
          <Route path="/login" component={Login} />
          <Route component={PageNotFound} />
        </Switch>
        <LogoutButton />
      </div>
    );
  }
}
