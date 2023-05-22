import { Button } from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { Permission } from "api";
import * as backend from "backend";
import * as LocalStorage from "backend/localStorage";
import history, { Path } from "browserHistory";
import { appBarHeight } from "components/AppBar/AppBarComponent";
import { tabColor } from "types/theme";

interface NavigationButtonsProps {
  currentTab: Path;
}

export async function getIsAdminOrOwner(): Promise<boolean> {
  const user = LocalStorage.getCurrentUser();
  if (!user) {
    return false;
  }
  if (user.isAdmin) {
    return true;
  }
  const userRoleID = user.projectRoles[LocalStorage.getProjectId()];
  if (userRoleID) {
    const role = await backend.getUserRole(userRoleID);
    return role.permissions.includes(Permission.Owner);
  }
  return false;
}

/** A button that redirects to the home page */
export default function NavigationButtons(
  props: NavigationButtonsProps
): ReactElement {
  const { t } = useTranslation();
  const [isAdminOrOwner, setIsAdminOrOwner] = useState<boolean>(false);

  getIsAdminOrOwner().then(setIsAdminOrOwner);

  const navButton = (path: Path, stringId: string): ReactElement => {
    return (
      <Button
        id={stringId.split(".").pop()}
        onClick={() => history.push(path)}
        color="inherit"
        style={{
          background: tabColor(props.currentTab, path),
          maxHeight: appBarHeight,
          width: "min-content",
        }}
      >
        {t(stringId)}
      </Button>
    );
  };

  return (
    <>
      {navButton(Path.DataEntry, "appBar.dataEntry")}
      {navButton(Path.Goals, "appBar.dataCleanup")}
      {isAdminOrOwner && navButton(Path.Statistics, "appBar.statistics")}
    </>
  );
}
