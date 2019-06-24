//external modules
import React from "react";

//TC modules
import CreateProject from "../CreateProject";
import { Route, Switch, Router } from "react-router-dom";
import { PrivateRoute } from "../PrivateRoute";
import { LogoutButton } from "../Login/LogoutButton";
import Login from "../Login";
import { Always } from "../Always";
import { GoalTimeline } from "../GoalTimeline/GoalTimelineComponent";

export const history = createBrowserHistory();
import GoalWrapper from "../GoalWrapper/";
import { createBrowserHistory } from "history";

export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Router history={history}>
          <Switch>
            <PrivateRoute exact path="/" component={CreateProject} />
            <PrivateRoute exact path="/timeline" component={GoalTimeline} />
            <Route path="/login" component={Login} />
            <Route component={Always} />
          </Switch>
        </Router>

        <hr />
        <LogoutButton />
      </div>
    );
  }
}
