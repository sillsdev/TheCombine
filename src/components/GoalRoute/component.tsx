import React from "react";
import { Switch, Route } from "react-router-dom";
import { GoalTimeline } from "../GoalTimeline/GoalTimelineComponent";
import PageNotFound from "../PageNotFound/component";
import { PrivateRoute } from "../PrivateRoute";
import BaseGoalScreen from "../../goals/DefaultGoal/BaseGoalScreen";

/**
 * A wrapper on all goal components. The component that will be displayed will
 * be selected based on the URL specified in the browser address bar.
 */
export class GoalRoute extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          <PrivateRoute exact path="/goals" component={GoalTimeline} />
          <PrivateRoute
            exact
            path="/goals/charInventory"
            component={BaseGoalScreen}
          />
          <PrivateRoute
            exact
            path="/goals/createCharInv"
            component={BaseGoalScreen}
          />
          <PrivateRoute
            exact
            path="/goals/createStrWordInv"
            component={BaseGoalScreen}
          />
          <PrivateRoute
            exact
            path="/goals/handleFlags"
            component={BaseGoalScreen}
          />
          <PrivateRoute
            exact
            path="/goals/mergeDups"
            component={BaseGoalScreen}
          />
          <PrivateRoute
            exact
            path="/goals/spellCheckGloss"
            component={BaseGoalScreen}
          />
          <PrivateRoute
            exact
            path="/goals/validateChars"
            component={BaseGoalScreen}
          />
          <PrivateRoute
            exact
            path="/goals/validateStrWords"
            component={BaseGoalScreen}
          />
          <PrivateRoute
            exact
            path="/goals/viewFinal"
            component={BaseGoalScreen}
          />
          <Route component={PageNotFound} />
        </Switch>
      </div>
    );
  }
}
