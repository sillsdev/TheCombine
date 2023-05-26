import loadable from "@loadable/component";
import { ReactElement, useEffect } from "react";
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
import { updateLangFromUser } from "i18n";

const BaseGoalScreen = loadable(
  () => import("goals/DefaultGoal/BaseGoalScreen")
);
const DataEntry = loadable(() => import("components/DataEntry"));
const GoalTimeline = loadable(() => import("components/GoalTimeline"));

export default function AppWithBar(): ReactElement {
  useEffect(updateLangFromUser, []);

  return (
    <>
      <SignalRHub />
      <AppBar />
      <Switch>
        <Route exact path={Path.DataEntry} component={DataEntry} />
        <Route exact path={Path.GoalCurrent} component={BaseGoalScreen} />
        <Route exact path={Path.GoalNext} component={NextGoalScreen} />
        <Route exact path={Path.Goals} component={GoalTimeline} />
        <Route exact path={Path.ProjScreen} component={ProjectScreen} />
        <Route exact path={Path.ProjSettings} component={ProjectSettings} />
        <Route exact path={Path.SiteSettings} component={SiteSettings} />
        <Route exact path={Path.Statistics} component={Statistics} />
        <Route exact path={Path.UserSettings} component={UserSettings} />
        <Route component={PageNotFound} />
      </Switch>
    </>
  );
}
