import React from "react";
import AppBarComponent from "../AppBar/AppBarComponent";
import { Typography } from "@material-ui/core";
import tractor from "../../resources/tractor.png";

/**
 * A custom 404 page that should be displayed anytime the user tries to navigate
 * to a nonexistent route.
 */
export default class PageNotFound extends React.Component {
  render() {
    return (
      <div>
        <AppBarComponent />
        <Typography variant="h4" style={{ textAlign: "center" }}>
          404: Page not found
        </Typography>
        <a href="../goals">
          <img
            src={tractor}
            alt="Tractor"
            style={{ width: "50%", margin: "0% 25%" }}
          />
        </a>
        <Typography variant="h4" style={{ textAlign: "center" }}>
          Click on the combine to go back home
        </Typography>
      </div>
    );
  }
}
