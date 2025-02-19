import { AppBar, Grid, Toolbar } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { getProjectId } from "backend/localStorage";
import { appBarHeight } from "components/AppBar/AppBarTypes";
import Logo from "components/AppBar/Logo";
import NavigationButtons from "components/AppBar/NavigationButtons";
import ProjectButtons from "components/AppBar/ProjectButtons";
import UserGuideButton from "components/AppBar/UserGuideButton";
import UserMenu from "components/AppBar/UserMenu";
import { topBarHeight } from "components/LandingPage/TopBar";
import DownloadButton from "components/ProjectExport/DownloadButton";
import { Path } from "types/path";
import theme from "types/theme";
import { getBasePath } from "utilities/pathUtilities";

/** An app bar shown at the top of all logged in pages */
export default function AppBarComponent(): ReactElement {
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState<Path>(Path.ProjScreen);

  useEffect(() => setCurrentTab(getBasePath(location.pathname)), [location]);

  return (
    <div className="NavigationBar" style={{ marginBottom: topBarHeight }}>
      <AppBar
        position="fixed"
        style={{ maxHeight: appBarHeight, zIndex: theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Logo />
              {!!getProjectId() && (
                <NavigationButtons currentTab={currentTab} />
              )}
            </Grid>
            <Grid item>
              {!!getProjectId() && <ProjectButtons currentTab={currentTab} />}
              <DownloadButton colorSecondary />
            </Grid>
            <Grid item>
              <UserMenu currentTab={currentTab} />
              <UserGuideButton />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
  );
}
