import React from "react";
import { Route, Switch, useLocation } from "react-router-dom";

import { getBasePath, path } from "../../history";
import AppBar from "../AppBar/AppBarComponent";
import DataEntry from "../DataEntry";
import GoalRoute from "../GoalRoute/component";
import PageNotFound from "../PageNotFound/component";
import ProjectSettings from "../ProjectSettings";
import ProjectScreen from "../ProjectScreen/ProjectScreenComponent";
import SiteSettings from "../SiteSettings/SiteSettingsComponent";
import UserSettings from "../UserSettings/UserSettings";

export default function AppWithBar() {
  let location = useLocation();
  const [currentLoc, setCurrentLoc] = React.useState<path>(path.projScreen);

  React.useEffect(() => {
    console.log(location);
    setCurrentLoc(getBasePath(location.pathname));
  }, [location]);

  return (
    <React.Fragment>
      <AppBar currentTab={currentLoc} />
      <Switch>
        <Route exact path={path.projScreen} component={ProjectScreen} />
        <Route exact path={path.dataEntry} component={DataEntry} />
        <Route exact path={path.projSettings} component={ProjectSettings} />
        <Route exact path={path.siteSettings} component={SiteSettings} />
        <Route exact path={path.userSettings} component={UserSettings} />
        <Route path={path.goals} component={GoalRoute} />
        <Route component={PageNotFound} />
      </Switch>
    </React.Fragment>
  );
}
