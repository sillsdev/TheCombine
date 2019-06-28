import history from "../../history";
import React from "react";
import { Button } from "@material-ui/core";
import logo from "../../resources/CombineLogoV1.png";

/**
 * A button that redirects to the home page
 */
export class GoToHomeButton extends React.Component {
  render() {
    return (
      <Button
        onClick={() => {
          history.push("/goals");
        }}
      >
        <img src={logo} height="50" alt="Logo" />
      </Button>
    );
  }
}
