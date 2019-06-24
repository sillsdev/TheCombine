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
        <Switch>
          <PrivateRoute exact path="/" component={CreateProject} />
          <Route exact path="/goals" component={GoalTimeline} />
          <Route exact path="/goals/charInvCreation" component={GoalWrapper} />
          <Route exact path="/goals/createCharInv" component={GoalWrapper} />
          <Route exact path="/goals/createStrWordInv" component={GoalWrapper} />
          <Route exact path="/goals/handleFlags" component={GoalWrapper} />
          <Route exact path="/goals/mergeDups" component={GoalWrapper} />
          <Route exact path="/goals/spellCheckGloss" component={GoalWrapper} />
          <Route exact path="/goals/validateChars" component={GoalWrapper} />
          <Route exact path="/goals/validateStrWords" component={GoalWrapper} />
          <Route exact path="/goals/viewFinal" component={GoalWrapper} />
          <Route path="/login" component={Login} />
          <Route component={Always} />
        </Switch>
        <LogoutButton />
      </div>
    );
  }
}
