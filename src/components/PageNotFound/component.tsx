import React from "react";

/**
 * A custom 404 page that should be displayed anytime the user tries to navigate
 * to a nonexistent route.
 */
export default class PageNotFound extends React.Component {
  render() {
    return (
      <div>
        <h1>Page not found</h1>
      </div>
    );
  }
}
