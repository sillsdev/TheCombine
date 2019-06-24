import React from "react";
import { Switch, Route } from "react-router-dom";
import GoalWrapper from "../GoalWrapper";
import { GoalTimeline } from "../GoalTimeline/GoalTimelineComponent";
import { PageNotFound } from "../PageNotFound";
import { PrivateRoute } from "../PrivateRoute";

/*
 * Render either the goal timeline or the goal the user is currently working on.
 */
export class GoalRoute extends React.Component {
  render() {
    return (
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
        <PrivateRoute exact path="/goals/handleFlags" component={GoalWrapper} />
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
        <PrivateRoute component={PageNotFound} />
      </Switch>
    );
  }
}
