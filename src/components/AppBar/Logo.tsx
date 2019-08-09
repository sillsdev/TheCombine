import React from "react";
import { Button } from "@material-ui/core";
import logo from "../../resources/CombineLogoV1.png";

/** A button that redirects to the home page */
export default function Logo() {
  return (
    <Button>
      <img src={logo} height="50" alt="Logo" />
    </Button>
  );
}
