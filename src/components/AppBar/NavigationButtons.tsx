import { Button } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";
import { useDispatch } from "react-redux";

import history, { Path } from "browserHistory";
import { OpenTreeAction } from "components/TreeView/TreeViewActions";
import { tabColor } from "types/theme";

interface NavigationButtonsProps {
  currentTab: Path;
}

/** A button that redirects to the home page */
export default function NavigationButtons(props: NavigationButtonsProps) {
  const dispatch = useDispatch();

  return (
    <React.Fragment>
      <Button
        id="data-entry"
        onClick={() => {
          dispatch(OpenTreeAction());
          history.push(Path.DataEntry);
        }}
        color="inherit"
        style={{
          width: "min-content",
          background: tabColor(props.currentTab, Path.DataEntry),
        }}
      >
        <Translate id="appBar.dataEntry" />
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
        <Translate id="appBar.dataCleanup" />
      </Button>
    </React.Fragment>
  );
}
