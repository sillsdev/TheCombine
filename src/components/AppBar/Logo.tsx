import { Button, Hidden } from "@mui/material";
import { ReactElement } from "react";

import history, { Path } from "browserHistory";
import logo from "resources/CombineLogoV1White.png";
import smallLogo from "resources/CombineSmallLogoV1.png";

/** A button that redirects to the home page */
export default function Logo(): ReactElement {
  return (
    <Button onClick={() => history.push(Path.ProjScreen)} id="logo-button">
      <Hidden lgDown>
        <img src={logo} height="50" alt="Logo" />
      </Hidden>
      <Hidden lgUp mdDown>
        <img src={logo} height="40" alt="Logo" />
      </Hidden>
      <Hidden mdUp>
        <img src={smallLogo} height="35" alt="Logo" />
      </Hidden>
    </Button>
  );
}
