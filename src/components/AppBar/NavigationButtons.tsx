import React from "react";
import { Button } from "@material-ui/core";
import history from "../../history";

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
        data entry
      </Button>
      <Button
        onClick={() => {
          history.location.pathname === "/"
            ? history.push("/")
            : history.push("/goals");
        }}
        color="inherit"
      >
        data cleanup
      </Button>
    </React.Fragment>
  );
}
