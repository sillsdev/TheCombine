import React from "react";
import { Switch, Route } from "react-router-dom";

import BaseGoalScreen from "goals/DefaultGoal/BaseGoalScreen";
import { Path } from "browserHistory";
import GoalTimeline from "components/GoalTimeline";
import PageNotFound from "components/PageNotFound/component";
import PrivateRoute from "components/PrivateRoute";

/**
 * A wrapper on all goal components. The component that will be displayed will
 * be selected based on the URL specified in the browser address bar.
 */
export default function GoalRoute() {
  return (
    <div>
      <Switch>
        <PrivateRoute exact path={Path.Goals} component={GoalTimeline} />
        <PrivateRoute path={`${Path.Goals}/:id`} component={BaseGoalScreen} />
        <Route component={PageNotFound} />
      </Switch>
    </div>
  );
}
