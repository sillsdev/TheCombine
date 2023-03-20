import { Button } from "@mui/material";
import React, { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import * as backend from "backend";
import * as LocalStorage from "backend/localStorage";
import history, { Path } from "browserHistory";
import { openTreeAction } from "components/TreeView/TreeViewActions";
import { useAppDispatch } from "types/hooks";
import { tabColor } from "types/theme";
import { Permission } from "api";

interface NavigationButtonsProps {
  currentTab: Path;
}

export async function getIsAdminOrOwner(): Promise<boolean> {
  const user = LocalStorage.getCurrentUser();
  if (user?.isAdmin) {
    return true;
  } else {
    const projectId = LocalStorage.getProjectId();
    const userRoleID = user?.projectRoles[projectId];
    if (userRoleID) {
      return backend.getUserRole(userRoleID).then((role) => {
        return role.permissions.includes(Permission.Owner);
      });
    }
  }
  return false;
}

/** A button that redirects to the home page */
export default function NavigationButtons(
  props: NavigationButtonsProps
): ReactElement {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [isAdminOrOwner, setIsAdminOrOwner] = useState<boolean>(false);

  getIsAdminOrOwner().then(setIsAdminOrOwner);

  return (
    <React.Fragment>
      <Button
        id="data-entry"
        onClick={() => {
          dispatch(openTreeAction());
          history.push(Path.DataEntry);
        }}
        color="inherit"
        style={{
          width: "min-content",
          background: tabColor(props.currentTab, Path.DataEntry),
        }}
      >
        {t("appBar.dataEntry")}
      </Button>
      <Button
        id="goals"
        onClick={() => {
          history.push(Path.Goals);
        }}
        color="inherit"
        style={{
          width: "min-content",
          background: tabColor(props.currentTab, Path.Goals),
        }}
      >
        {t("appBar.dataCleanup")}
      </Button>
      {isAdminOrOwner && (
        <Button
          id="statistics"
          onClick={() => {
            history.push(Path.Statistics);
          }}
          color="inherit"
          style={{
            width: "min-content",
            background: tabColor(props.currentTab, Path.Statistics),
          }}
        >
          {t("appBar.statistics")}
        </Button>
      )}
    </React.Fragment>
  );
}
