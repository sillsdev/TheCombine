import { Button, Hidden } from "@material-ui/core";
import { ReactElement } from "react";

import history, { Path } from "browserHistory";
import logo from "resources/CombineLogoV1White.png";
import smallLogo from "resources/CombineSmallLogoV1.png";

/** A button that redirects to the home page */
export default function Logo(): ReactElement {
  return (
    <Button
      onClick={() => {
        history.push(Path.ProjScreen);
      }}
      id="logo-button"
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
