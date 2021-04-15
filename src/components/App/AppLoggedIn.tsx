import loadable from "@loadable/component";
import React, { useEffect, useState } from "react";
import { Route, Switch, useLocation } from "react-router-dom";

import { getBasePath, Path } from "browserHistory";
import SignalRHub from "components/App/SignalRHub";
import AppBar from "components/AppBar/AppBarComponent";
import PageNotFound from "components/PageNotFound/component";
import ProjectScreen from "components/ProjectScreen/ProjectScreenComponent";
import ProjectSettings from "components/ProjectSettings";
import SiteSettings from "components/SiteSettings/SiteSettingsComponent";
import UserSettings from "components/UserSettings/UserSettings";

const BaseGoalScreen = loadable(
  () => import("goals/DefaultGoal/BaseGoalScreen")
);
const DataEntry = loadable(() => import("components/DataEntry"));
const GoalTimeline = loadable(() => import("components/GoalTimeline"));

export default function AppWithBar() {
  const location = useLocation();
  const [currentLoc, setCurrentLoc] = useState<Path>(Path.ProjScreen);

  useEffect(() => setCurrentLoc(getBasePath(location.pathname)), [location]);

  return (
    <React.Fragment>
      <SignalRHub />
      <AppBar currentTab={currentLoc} />
      <Switch>
        <Route exact path={Path.DataEntry} component={DataEntry} />
        <Route exact path={Path.GoalCurrent} component={BaseGoalScreen} />
        <Route exact path={Path.Goals} component={GoalTimeline} />
        <Route exact path={Path.ProjScreen} component={ProjectScreen} />
        <Route exact path={Path.ProjSettings} component={ProjectSettings} />
        <Route exact path={Path.SiteSettings} component={SiteSettings} />
        <Route exact path={Path.UserSettings} component={UserSettings} />
        <Route component={PageNotFound} />
      </Switch>
    </React.Fragment>
  );
}
