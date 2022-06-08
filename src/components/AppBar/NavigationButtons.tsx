import { Button } from "@material-ui/core";
import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import history, { Path } from "browserHistory";
import { openTreeAction } from "components/TreeView/TreeViewActions";
import { tabColor } from "types/theme";

interface NavigationButtonsProps {
  currentTab: Path;
}

/** A button that redirects to the home page */
export default function NavigationButtons(
  props: NavigationButtonsProps
): ReactElement {
  const dispatch = useDispatch();
  const { t } = useTranslation();

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
    </React.Fragment>
  );
}
