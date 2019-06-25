import React from "react";
import { Switch, Route } from "react-router-dom";
import GoalWrapper from "../GoalWrapper";
import { GoalTimeline } from "../GoalTimeline/GoalTimelineComponent";
import PageNotFound from "../PageNotFound/component";
import { PrivateRoute } from "../PrivateRoute";
import NavigationBar from "../NavigationBar";

/*
 * Navigate to routes specific to goals. This includes the goal timeline, as well
 * as components for all goal types.
 */
export class GoalRoute extends React.Component {
  render() {
    return (
      <div>
        <NavigationBar />
        <Switch>
          <PrivateRoute exact path="/goals" component={GoalTimeline} />
          <PrivateRoute
            exact
            path="/goals/charInvCreation"
            component={GoalWrapper}
          />
          <PrivateRoute
            exact
            path="/goals/createCharInv"
            component={GoalWrapper}
          />
          <PrivateRoute
            exact
            path="/goals/createStrWordInv"
            component={GoalWrapper}
          />
          <PrivateRoute
            exact
            path="/goals/handleFlags"
            component={GoalWrapper}
          />
          <PrivateRoute exact path="/goals/mergeDups" component={GoalWrapper} />
          <PrivateRoute
            exact
            path="/goals/spellCheckGloss"
            component={GoalWrapper}
          />
          <PrivateRoute
            exact
            path="/goals/validateChars"
            component={GoalWrapper}
          />
          <PrivateRoute
            exact
            path="/goals/validateStrWords"
            component={GoalWrapper}
          />
          <PrivateRoute exact path="/goals/viewFinal" component={GoalWrapper} />
          <Route component={PageNotFound} />
        </Switch>
      </div>
    );
  }
}
