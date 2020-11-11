import { Button } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

import history, { path } from "../../history";
import { CurrentTab, tabColor } from "../../types/currentTab";

interface NavigationButtonsProps {
  currentTab: CurrentTab;
}

/** A button that redirects to the home page */
export default function NavigationButtons(props: NavigationButtonsProps) {
  return (
    <React.Fragment>
      <Button
        id="data-entry"
        onClick={() => {
          history.push(path.dataEntry);
        }}
        color="inherit"
        style={{
          background: tabColor(props.currentTab, CurrentTab.DataEntry),
        }}
      >
        <Translate id="appBar.dataEntry" />
      </Button>
      <Button
        id="goals"
        onClick={() => {
          history.push(path.goals);
        }}
        color="inherit"
        style={{
          background: tabColor(props.currentTab, CurrentTab.DataCleanup),
        }}
      >
        <Translate id="appBar.dataCleanup" />
      </Button>
    </React.Fragment>
  );
}
