import { BarChart, Settings } from "@mui/icons-material";
import { Button, Hidden, Tooltip, Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Permission } from "api/models";
import { getUserRole } from "backend";
import { getCurrentUser, getProjectId } from "backend/localStorage";
import {
  TabProps,
  buttonMinHeight,
  shortenName,
  tabColor,
} from "components/AppBar/AppBarTypes";
import { StoreState } from "types";
import { Path } from "types/path";

export const projButtonId = "project-settings";
export const statButtonId = "project-statistics";

const enum projNameLength {
  sm = 15,
  md = 25,
  lg = 45,
  xl = 75,
}

export async function getIsAdminOrOwner(): Promise<boolean> {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }
  if (user.isAdmin) {
    return true;
  }
  const userRoleID = user.projectRoles[getProjectId()];
  if (userRoleID) {
    const role = await getUserRole(userRoleID);
    return role.permissions.includes(Permission.Owner);
  }
  return false;
}

/** A button that redirects to the project settings */
export default function ProjectButtons(props: TabProps): ReactElement {
  const projectName = useSelector(
    (state: StoreState) => state.currentProjectState.project.name
  );
  const [isAdminOrOwner, setIsAdminOrOwner] = useState<boolean>(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    getIsAdminOrOwner().then(setIsAdminOrOwner);
  }, [setIsAdminOrOwner]);

  return (
    <>
      {isAdminOrOwner && (
        <Tooltip title={t("appBar.statistics")}>
          <Button
            id={statButtonId}
            onClick={() => navigate(Path.Statistics)}
            color="inherit"
            style={{
              background: tabColor(props.currentTab, Path.Statistics),
              minHeight: buttonMinHeight,
              minWidth: 0,
              margin: 5,
            }}
          >
            <BarChart />
          </Button>
        </Tooltip>
      )}
      <Tooltip title={t("appBar.projectSettings")}>
        <Button
          id={projButtonId}
          onClick={() => navigate(Path.ProjSettings)}
          color="inherit"
          style={{
            background: tabColor(props.currentTab, Path.ProjSettings),
            minHeight: buttonMinHeight,
            minWidth: 0,
          }}
        >
          <Settings />
          <Hidden smDown>
            <Typography
              display="inline"
              style={{ marginLeft: 5, marginRight: 5 }}
            >
              <Hidden xlDown>
                {shortenName(projectName, projNameLength.xl)}
              </Hidden>
              <Hidden lgDown xlUp>
                {shortenName(projectName, projNameLength.lg)}
              </Hidden>
              <Hidden mdDown lgUp>
                {shortenName(projectName, projNameLength.md)}
              </Hidden>
              <Hidden mdUp smDown>
                {shortenName(projectName, projNameLength.sm)}
              </Hidden>
            </Typography>
          </Hidden>
        </Button>
      </Tooltip>
    </>
  );
}
