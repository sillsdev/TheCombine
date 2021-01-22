import React, { useEffect, useState } from "react";
import { Route, Switch, useLocation } from "react-router-dom";

import { getBasePath, Path } from "browserHistory";
import AppBar from "components/AppBar/AppBarComponent";
import DataEntry from "components/DataEntry";
import GoalRoute from "components/GoalRoute/component";
import PageNotFound from "components/PageNotFound/component";
import ProjectScreen from "components/ProjectScreen/ProjectScreenComponent";
import ProjectSettings from "components/ProjectSettings";
import SiteSettings from "components/SiteSettings/SiteSettingsComponent";
import UserSettings from "components/UserSettings/UserSettings";
import SignalRHub from "components/App/SignalRHub";

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
