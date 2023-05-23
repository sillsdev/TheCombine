import { BarChart, Settings } from "@mui/icons-material";
import { Button, Hidden, Tooltip, Typography } from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Permission } from "api/models";
import { getUserRole } from "backend";
import { getCurrentUser, getProjectId } from "backend/localStorage";
import history, { Path } from "browserHistory";
import { StoreState } from "types";
import { tabColor } from "types/theme";

interface ProjectNameButtonProps {
  currentTab: Path;
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
export default function ProjectNameButton(
  props: ProjectNameButtonProps
): ReactElement {
  const projectName = useSelector(
    (state: StoreState) => state.currentProjectState.project.name
  );
  const [isAdminOrOwner, setIsAdminOrOwner] = useState<boolean>(false);
  const { t } = useTranslation();

  getIsAdminOrOwner().then(setIsAdminOrOwner);

  return (
    <>
      {isAdminOrOwner && (
        <Tooltip title={t("appBar.statistics")}>
          <Button
            id="project-statistics"
            onClick={() => history.push(Path.Statistics)}
            color="inherit"
            style={{
              background: tabColor(props.currentTab, Path.Statistics),
              minWidth: 0,
            }}
          >
            <BarChart />
          </Button>
        </Tooltip>
      )}
      <Tooltip title={t("appBar.projectSettings")}>
        <Button
          id="project-settings"
          onClick={() => history.push(Path.ProjSettings)}
          color="inherit"
          style={{
            background: tabColor(props.currentTab, Path.ProjSettings),
            minWidth: 0,
          }}
        >
          <Settings />
        </Button>
      </Tooltip>
      <Hidden smDown>
        <Typography display="inline" style={{ margin: 5 }}>
          {projectName}
        </Typography>
      </Hidden>
    </>
  );
}
