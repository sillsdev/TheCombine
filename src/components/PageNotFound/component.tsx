import React from "react";
import AppBarComponent from "../AppBar/AppBarComponent";
import { Typography } from "@material-ui/core";

/**
 * A custom 404 page that should be displayed anytime the user tries to navigate
 * to a nonexistent route.
 */
export default class PageNotFound extends React.Component {
  render() {
    return (
      <div>
        <AppBarComponent />
        <Typography variant="h4">Page not found</Typography>
      </div>
    );
  }
}
