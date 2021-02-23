import { Button, Hidden } from "@material-ui/core";
import React from "react";

import history, { Path } from "browserHistory";
import logo from "resources/CombineLogoV1White.png";
import smallLogo from "resources/CombineSmallLogoV1.png";

/** A button that redirects to the home page */
export default function Logo() {
  return (
    <Button
      onClick={() => {
        history.push(Path.ProjScreen);
      }}
    >
      <Hidden xsDown>
        <img src={logo} height="50" alt="Logo" />
      </Hidden>
      <Hidden smUp>
        <img src={smallLogo} height="50" alt="Logo" />
      </Hidden>
    </Button>
  );
}
