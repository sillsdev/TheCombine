import React from "react";
import { Route, Switch, useLocation } from "react-router-dom";

import { getBasePath, Path } from "../../history";
import AppBar from "../AppBar/AppBarComponent";
import DataEntry from "../DataEntry";
import GoalRoute from "../GoalRoute/component";
import PageNotFound from "../PageNotFound/component";
import ProjectSettings from "../ProjectSettings";
import ProjectScreen from "../ProjectScreen/ProjectScreenComponent";
import SiteSettings from "../SiteSettings/SiteSettingsComponent";
import UserSettings from "../UserSettings/UserSettings";

export default function AppWithBar() {
  const location = useLocation();
  const [currentLoc, setCurrentLoc] = React.useState<Path>(Path.ProjScreen);

  React.useEffect(() => {
    setCurrentLoc(getBasePath(location.pathname));
  }, [location]);

  return (
    <React.Fragment>
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
