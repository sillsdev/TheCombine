import loadable from "@loadable/component";
import { CssBaseline } from "@mui/material";
import { Theme, ThemeProvider, createTheme } from "@mui/material/styles";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { Route, Routes } from "react-router";

import { updateUser } from "backend";
import { getCurrentUser } from "backend/localStorage";
import AnalyticsConsent from "components/AnalyticsConsent";
import DatePickersLocalizationProvider from "components/App/DatePickersLocalizationProvider";
import AppBar from "components/AppBar";
import PageNotFound from "components/PageNotFound/component";
import ExportHub from "components/ProjectExport/ExportHub";
import ProjectScreen from "components/ProjectScreen";
import NextGoalScreen from "goals/DefaultGoal/NextGoalScreen";
import MergeHub from "goals/MergeDuplicates/MergeHub";
import { updateLangFromUser } from "i18n";
import { useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { Path } from "types/path";
import { RuntimeConfig } from "types/runtimeConfig";
import FontContext, { ProjectFonts } from "utilities/fontContext";
import { getProjCss } from "utilities/fontCssUtilities";
import { routerPath } from "utilities/pathUtilities";

const BaseGoalScreen = loadable(
  () => import("goals/DefaultGoal/BaseGoalScreen")
);
const DataEntry = loadable(() => import("components/DataEntry"));
const GoalTimeline = loadable(() => import("components/GoalTimeline"));
const ProjectSettings = loadable(() => import("components/ProjectSettings"));
const SiteSettings = loadable(() => import("components/SiteSettings"));
const Statistics = loadable(() => import("components/Statistics/Statistics"));
const UserSettings = loadable(
  () => import("components/UserSettings/UserSettings")
);

export default function AppWithBar(): ReactElement {
  const proj = useAppSelector(
    (state: StoreState) => state.currentProjectState.project,
    (proj1, proj2) =>
      proj1.id === proj2.id &&
      proj1.analysisWritingSystems.length ===
        proj2.analysisWritingSystems.length &&
      proj1.analysisWritingSystems.every(
        (ws, i) =>
          proj2.analysisWritingSystems[i].bcp47 === ws.bcp47 &&
          proj2.analysisWritingSystems[i].font === ws.font
      )
  );

  const projFonts = useMemo(() => new ProjectFonts(proj), [proj]);

  const [styleOverrides, setStyleOverrides] = useState<string>();
  const [answeredConsent, setAnsweredConsent] = useState(
    getCurrentUser()?.answeredConsent
  );

  const showConsentDialog =
    !RuntimeConfig.getInstance().isOffline() && !answeredConsent;

  async function handleConsentChange(analyticsOn?: boolean): Promise<void> {
    await updateUser({
      ...getCurrentUser()!,
      analyticsOn,
      answeredConsent: true,
    });
    setAnsweredConsent(true);
  }

  useEffect(() => {
    updateLangFromUser();
  }, []);

  useEffect(() => {
    if (proj.id) {
      getProjCss(proj).then((cssLines) => {
        setStyleOverrides(
          cssLines.join("\n").replaceAll("\r", "").replaceAll("\\", "/")
        );
      });
    }
  }, [proj]);

  const overrideThemeFont = (theme: Theme): Theme =>
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
    <DatePickersLocalizationProvider>
      <ExportHub />
      <MergeHub />
      <AppBar />
      <FontContext.Provider value={projFonts}>
        <ThemeProvider theme={overrideThemeFont}>
          <CssBaseline />
          {showConsentDialog && (
            <AnalyticsConsent onChangeConsent={handleConsentChange} required />
          )}
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
            <Route
              path={routerPath(Path.Statistics)}
              element={<Statistics />}
            />
            <Route
              path={routerPath(Path.UserSettings)}
              element={<UserSettings />}
            />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </ThemeProvider>
      </FontContext.Provider>
    </DatePickersLocalizationProvider>
  );
}
