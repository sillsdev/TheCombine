import loadable from "@loadable/component";
import { CssBaseline } from "@mui/material";
import { Theme, ThemeProvider, createTheme } from "@mui/material/styles";
import { ReactElement, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import { apiBaseURL, getFonts } from "backend";
import SignalRHub from "components/App/SignalRHub";
import AppBar from "components/AppBar/AppBarComponent";
import PageNotFound from "components/PageNotFound/component";
import ProjectScreen from "components/ProjectScreen";
import ProjectSettings from "components/ProjectSettings";
import SiteSettings from "components/SiteSettings";
import Statistics from "components/Statistics/Statistics";
import UserSettings from "components/UserSettings/UserSettings";
import NextGoalScreen from "goals/DefaultGoal/NextGoalScreen";
import { updateLangFromUser } from "i18n";
import { StoreState } from "types";
import { useAppSelector } from "types/hooks";
import { Path } from "types/path";
import { routerPath } from "utilities/pathUtilities";

const BaseGoalScreen = loadable(
  () => import("goals/DefaultGoal/BaseGoalScreen")
);
const DataEntry = loadable(() => import("components/DataEntry"));
const GoalTimeline = loadable(() => import("components/GoalTimeline"));

export default function AppWithBar(): ReactElement {
  const projId = useAppSelector(
    (state: StoreState) => state.currentProjectState.project.id
  );
  const projLangCount = useAppSelector(
    (state: StoreState) =>
      state.currentProjectState.project.analysisWritingSystems.length
  );

  const [styleOverrides, setStyleOverrides] = useState<string>();

  useEffect(updateLangFromUser, []);

  useEffect(() => {
    if (projId) {
      getFonts(projId).then((cssLines) => {
        setStyleOverrides(
          cssLines
            .join("\n")
            .replaceAll("\r", "")
            .replaceAll("\\", "/")
            .replace("%BASE_PATH%", `${apiBaseURL}/projects`)
        );
      });
    }
  }, [projId, projLangCount]);

  useEffect(() => {
    console.info(styleOverrides);
  }, [styleOverrides]);

  const overrideThemeFont = (theme: Theme) =>
    styleOverrides
      ? createTheme({
          ...theme,
          components: {
            ...theme.components,
            MuiCssBaseline: {
              ...theme.components?.MuiCssBaseline,
              styleOverrides,
            },
          },
        })
      : theme;

  return (
    <>
      <SignalRHub />
      <AppBar />
      <ThemeProvider theme={overrideThemeFont}>
        <CssBaseline />
        <Routes>
          <Route path={routerPath(Path.DataEntry)} element={<DataEntry />} />
          <Route path={routerPath(Path.Goals)} element={<GoalTimeline />} />
          <Route
            path={routerPath(Path.GoalCurrent)}
            element={<BaseGoalScreen />}
          />
          <Route
            path={routerPath(Path.GoalNext)}
            element={<NextGoalScreen />}
          />
          <Route
            path={routerPath(Path.ProjScreen)}
            element={<ProjectScreen />}
          />
          <Route
            path={routerPath(Path.ProjSettings)}
            element={<ProjectSettings />}
          />
          <Route
            path={routerPath(Path.SiteSettings)}
            element={<SiteSettings />}
          />
          <Route path={routerPath(Path.Statistics)} element={<Statistics />} />
          <Route
            path={routerPath(Path.UserSettings)}
            element={<UserSettings />}
          />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </ThemeProvider>
    </>
  );
}
