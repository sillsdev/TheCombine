import React from "react";
import { Button } from "@material-ui/core";
import history from "../../history";
import { Translate } from "react-localize-redux";
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
          history.push("/data-entry");
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
          history.push("/goals");
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
