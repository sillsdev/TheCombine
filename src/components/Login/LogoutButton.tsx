import { history } from "../App/App";
import React from "react";
import { Button } from "@material-ui/core";

/**
 * A button that logs the user out by redirecting to the login page
 */
export class LogoutButton extends React.Component<{}, {}> {
  render() {
    return (
      <Button
        onClick={() => {
          history.push("/login");
        }}
      >
        Log out
      </Button>
    );
  }
}
