import loadable from "@loadable/component";
import React, { useEffect, useState } from "react";
import { Route, Switch, useLocation } from "react-router-dom";

import { getBasePath, Path } from "browserHistory";
import AppBar from "components/AppBar/AppBarComponent";
import PageNotFound from "components/PageNotFound/component";
import SignalRHub from "components/App/SignalRHub";

const DataEntry = loadable(() => import("components/DataEntry"));
const GoalRoute = loadable(() => import("components/GoalRoute/component"));
const ProjectScreen = loadable(
  () => import("components/ProjectScreen/ProjectScreenComponent")
);
const ProjectSettings = loadable(() => import("components/ProjectSettings"));
const SiteSettings = loadable(
  () => import("components/SiteSettings/SiteSettingsComponent")
);
const UserSettings = loadable(
  () => import("components/UserSettings/UserSettings")
);

export default function AppWithBar() {
  const location = useLocation();
  const [currentLoc, setCurrentLoc] = useState<Path>(Path.ProjScreen);

  useEffect(() => setCurrentLoc(getBasePath(location.pathname)), [location]);

  return (
    <React.Fragment>
      <SignalRHub />
      <AppBar currentTab={currentLoc} />
      <Switch>
        <Route exact path={Path.ProjScreen} component={ProjectScreen} />
        <Route exact path={Path.DataEntry} component={DataEntry} />
        <Route exact path={Path.ProjSettings} component={ProjectSettings} />
        <Route exact path={Path.SiteSettings} component={SiteSettings} />
        <Route exact path={Path.UserSettings} component={UserSettings} />
        <Route path={Path.Goals} component={GoalRoute} />
        <Route component={PageNotFound} />
      </Switch>
    </React.Fragment>
  );
}
