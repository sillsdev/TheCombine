import React from "react";
import { Switch, Route, RouteComponentProps } from "react-router-dom";
// import GoalWrapper from "../GoalWrapper";
import BaseGoalScreen from "../../goals/DefaultGoal/BaseGoalScreen";
import { GoalTimeline } from "../GoalTimeline/GoalTimelineComponent";
import PageNotFound from "../PageNotFound/component";
import { PrivateRoute } from "../PrivateRoute";
import NavigationBar from "../NavigationBar";
import { Goal } from "../../types/goals";

type TParams = { id: string };

function TestId({ match }: RouteComponentProps<TParams>) {
  return <h2>This is a page for product with ID: {match.params.id} </h2>;
}

export interface GoalRouteProps {
  goalOptions: Goal[];
}

/**
 * A wrapper on all goal components. The component that will be displayed will
 * be selected based on the URL specified in the browser address bar.
 */
export class GoalRoute extends React.Component<GoalRouteProps> {
  findGoalById(id: string, goalOptions: Goal[]): Goal | null {
    for (var goal of goalOptions) {
      if (goal.id === id) {
        return goal;
      }
    }
    return null;
  }

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
          <PrivateRoute path={`/goals/mergeDups:id`} component={GoalWrapper} />
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
