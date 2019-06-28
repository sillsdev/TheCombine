import React from "react";
import AppBarComponent from "../AppBar/AppBarComponent";

/**
 * A custom 404 page that should be displayed anytime the user tries to navigate
 * to a nonexistent route.
 */
export default class PageNotFound extends React.Component {
  render() {
    return (
      <div>
        <AppBarComponent />
        <h1>Page not found</h1>
      </div>
    );
  }
}
