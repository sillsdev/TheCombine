import React from "react";
import { Button } from "@material-ui/core";
import history from "../../history";
import { Translate } from "react-localize-redux";

/** A button that redirects to the home page */
export default function NavigationButtons() {
  return (
    <React.Fragment>
      <Button
        onClick={() => {
          history.location.pathname === "/"
            ? history.push("/")
            : history.push("/data-entry");
        }}
        color="inherit"
      >
        <Translate id="appBar.dataEntry" />
      </Button>
      <Button
        onClick={() => {
          history.location.pathname === "/"
            ? history.push("/")
            : history.push("/goals");
        }}
        color="inherit"
      >
        <Translate id="appBar.dataCleanup" />
      </Button>
    </React.Fragment>
  );
}
