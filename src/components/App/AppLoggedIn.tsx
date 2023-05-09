import loadable from "@loadable/component";
import React, { ReactElement } from "react";
import { Route, Switch } from "react-router-dom";

import { Path } from "browserHistory";
import SignalRHub from "components/App/SignalRHub";
import AppBar from "components/AppBar/AppBarComponent";
import PageNotFound from "components/PageNotFound/component";
import ProjectScreen from "components/ProjectScreen";
import ProjectSettings from "components/ProjectSettings/ProjectSettingsComponent";
import SiteSettings from "components/SiteSettings/SiteSettingsComponent";
import Statistics from "components/Statistics/Statistics";
import UserSettings from "components/UserSettings/UserSettings";
import NextGoalScreen from "goals/DefaultGoal/NextGoalScreen";

const BaseGoalScreen = loadable(
  () => import("goals/DefaultGoal/BaseGoalScreen")
);
const DataEntry = loadable(() => import("components/DataEntry"));
const GoalTimeline = loadable(() => import("components/GoalTimeline"));

export default function AppWithBar(): ReactElement {
  return (
    <React.Fragment>
      <SignalRHub />
      <AppBar />
      <Switch>
        <Route exact path={Path.DataEntry}>
          <DataEntry />
        </Route>
        <Route exact path={Path.GoalCurrent}>
          <BaseGoalScreen />
        </Route>
        <Route exact path={Path.GoalNext}>
          <NextGoalScreen />
        </Route>
        <Route exact path={Path.Goals}>
          <GoalTimeline />
        </Route>
        <Route exact path={Path.ProjScreen}>
          <ProjectScreen />
        </Route>
        <Route exact path={Path.ProjSettings}>
          <ProjectSettings />
        </Route>
        <Route exact path={Path.SiteSettings}>
          <SiteSettings />
        </Route>
        <Route exact path={Path.Statistics}>
          <Statistics />
        </Route>
        <Route exact path={Path.UserSettings}>
          <UserSettings />
        </Route>
        <Route>
          <PageNotFound />
        </Route>
      </Switch>
    </React.Fragment>
  );
}
