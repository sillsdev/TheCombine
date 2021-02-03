import { Typography } from "@material-ui/core";
import React from "react";

import history, { Path } from "browserHistory";
import tractor from "resources/tractor.png";

/**
 * A custom 404 page that should be displayed anytime the user tries to navigate
 * to a nonexistent route.
 */
export default function PageNotFound() {
  return (
    <React.Fragment>
      <Typography variant="h4" style={{ textAlign: "center" }}>
        404: Page not found
      </Typography>
      <img
        src={tractor}
        alt="Tractor"
        style={{ width: "50%", margin: "0% 25%" }}
        onClick={() => {
          history.push(Path.Goals);
        }}
      />
      <Typography variant="h4" style={{ textAlign: "center" }}>
        Click on the combine to go back home
      </Typography>
    </React.Fragment>
  );
}
