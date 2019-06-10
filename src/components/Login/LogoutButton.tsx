import { history } from "../App/App";
import React from "react";
import { Button } from "@material-ui/core";

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
