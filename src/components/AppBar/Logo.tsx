import { Button, Hidden } from "@mui/material";
import { ReactElement } from "react";

import history, { Path } from "browserHistory";
import logo from "resources/CombineLogoV1White.png";
import smallLogo from "resources/CombineSmallLogoV1.png";

/** A button that redirects to the home page */
export default function Logo(): ReactElement {
  return (
    <Button
      id="logo-button"
      onClick={() => history.push(Path.ProjScreen)}
      style={{ minWidth: 0, padding: 0 }}
    >
      <Hidden mdDown>
        <img src={logo} height="45" alt="Logo" />
      </Hidden>
      <Hidden smDown mdUp>
        <img src={smallLogo} height="30" alt="Logo" />
      </Hidden>
      <Hidden smUp>
        <img src={smallLogo} height="15" alt="Logo" />
      </Hidden>
    </Button>
  );
}
