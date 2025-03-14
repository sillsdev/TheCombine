import { BarChart, Settings } from "@mui/icons-material";
import {
  Button,
  Theme,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Permission } from "api/models";
import { hasPermission } from "backend";
import {
  TabProps,
  buttonMinHeight,
  shortenName,
  tabColor,
} from "components/AppBar/AppBarTypes";
import SpeakerMenu from "components/AppBar/SpeakerMenu";
import { type StoreState } from "rootRedux/types";
import { GoalStatus, GoalType } from "types/goals";
import { Path } from "types/path";

export const projButtonId = "project-settings";
export const statButtonId = "project-statistics";

const enum projNameLength {
  md = 17,
  lg = 34,
  xl = 51,
}

/** A button that redirects to the project settings */
export default function ProjectButtons(props: TabProps): ReactElement {
  const projectName = useSelector(
    (state: StoreState) => state.currentProjectState.project.name
  );
  const showSpeaker = useSelector(
    (state: StoreState) =>
      Path.DataEntry === props.currentTab ||
      (state.goalsState.currentGoal.goalType === GoalType.ReviewEntries &&
        state.goalsState.currentGoal.status === GoalStatus.InProgress)
  );
  const [hasStatsPermission, setHasStatsPermission] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isMdUp = useMediaQuery<Theme>((th) => th.breakpoints.up("md"));
  const isLg = useMediaQuery<Theme>((th) => th.breakpoints.only("lg"));
  const isXl = useMediaQuery<Theme>((th) => th.breakpoints.only("xl"));
  const nameLength = isXl
    ? projNameLength.xl
    : isLg
      ? projNameLength.lg
      : projNameLength.md;

  useEffect(() => {
    hasPermission(Permission.Statistics).then(setHasStatsPermission);
  }, []);

  return (
    <>
      {hasStatsPermission && (
        <Tooltip title={t("appBar.statistics")}>
          <Button
            color="inherit"
            id={statButtonId}
            onClick={() => navigate(Path.Statistics)}
            style={{
              background: tabColor(props.currentTab, Path.Statistics),
              margin: 5,
              minHeight: buttonMinHeight,
              minWidth: 0,
            }}
          >
            <BarChart />
          </Button>
        </Tooltip>
      )}
      <Tooltip title={t("appBar.projectSettings")}>
        <Button
          color="inherit"
          id={projButtonId}
          onClick={() => navigate(Path.ProjSettings)}
          style={{
            background: tabColor(props.currentTab, Path.ProjSettings),
            minHeight: buttonMinHeight,
            minWidth: 0,
          }}
        >
          <Settings />
          {isMdUp && (
            <Typography display="inline" style={{ marginInline: 5 }}>
              {shortenName(projectName, nameLength)}
            </Typography>
          )}
        </Button>
      </Tooltip>
      {showSpeaker && <SpeakerMenu />}
    </>
  );
}
