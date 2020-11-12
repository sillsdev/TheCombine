import { Button } from "@material-ui/core";
import React from "react";

import history, { path } from "../../history";
import logo from "../../resources/CombineLogoV1.png";
import smallLogo from "../../resources/CombineSmallLogoV1.png";

/** A button that redirects to the home page */
export default function Logo() {
  return (
    <Button
      onClick={() => {
        history.push(path.projScreen);
      }}
    >
      <img
        srcSet={`${logo} 1200w, ${smallLogo} 600w`}
        src={logo}
        height="50"
        alt="Logo"
      />
    </Button>
  );
}
