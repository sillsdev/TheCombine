import { Typography } from "@material-ui/core";
import React from "react";

import history, { path } from "../../history";
import tractor from "../../resources/tractor.png";
import { CurrentTab } from "../../types/currentTab";
import AppBarComponent from "../AppBar/AppBarComponent";

/**
 * A custom 404 page that should be displayed anytime the user tries to navigate
 * to a nonexistent route.
 */
export default function PageNotFound() {
  return (
    <div>
      <AppBarComponent currentTab={CurrentTab.PageNotFound} />
      <Typography variant="h4" style={{ textAlign: "center" }}>
        404: Page not found
      </Typography>
      <img
        src={tractor}
        alt="Tractor"
        style={{ width: "50%", margin: "0% 25%" }}
        onClick={() => {
          history.push(path.goals);
        }}
      />
      <Typography variant="h4" style={{ textAlign: "center" }}>
        Click on the combine to go back home
      </Typography>
    </div>
  );
}
