import history from "../../history";
import React from "react";
import { Button } from "@material-ui/core";
import logo from "../../resources/CombineLogoV1.png";

/**
 * A button that redirects to the home page
 */
export default function GoToHomeButton() {
  return (
    <Button
      onClick={() => {
        history.location.pathname === "/"
          ? history.push("/")
          : history.push("/goals");
      }}
    >
      <img src={logo} height="50" alt="Logo" />
    </Button>
  );
}
