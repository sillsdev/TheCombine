import React, { useState } from "react";
import { Button } from "@material-ui/core";
import history from "../../history";
import { Translate } from "react-localize-redux";
import { CurrentTab } from "../../types/currentTab";
import { shade } from "../../types/theme";

function tabColor(currentTab: CurrentTab, tabName: CurrentTab) {
  const colors = ["inherit", shade];
  if (currentTab === tabName) {
    return colors[1];
  } else return colors[0];
}

interface NavigationButtonsProps {
  currentTab: CurrentTab;
}

/** A button that redirects to the home page */
export default function NavigationButtons(props: NavigationButtonsProps) {
  return (
    <React.Fragment>
      <Button
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
