import { Button } from "@mui/material";
import React, { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import { getUser } from "backend";
import * as LocalStorage from "backend/localStorage";
import history, { Path } from "browserHistory";
import { openTreeAction } from "components/TreeView/TreeViewActions";
import { tabColor } from "types/theme";

interface NavigationButtonsProps {
  currentTab: Path;
}

export async function getIsAdmin(): Promise<boolean> {
  const userId = LocalStorage.getUserId();
  const user = await getUser(userId);
  if (user) {
    return user.isAdmin;
  }
  return false;
}

/** A button that redirects to the home page */
export default function NavigationButtons(
  props: NavigationButtonsProps
): ReactElement {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  getIsAdmin().then(setIsAdmin);

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
      {isAdmin && (
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
