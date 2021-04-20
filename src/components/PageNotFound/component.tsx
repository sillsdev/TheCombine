import { Typography } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

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
        <Translate id="generic.404Title" />
      </Typography>
      <img
        src={tractor}
        alt="Tractor"
        style={{ width: "50%", margin: "0% 25%" }}
        onClick={() => {
          history.push(Path.ProjScreen);
        }}
      />
      <Typography variant="h5" style={{ textAlign: "center" }}>
        <Translate id="generic.404Text" />
      </Typography>
    </React.Fragment>
  );
}
