import React from "react";
import { Button } from "@material-ui/core";
import history from "../../history";
import { Translate } from "react-localize-redux";

/** A button that redirects to the home page */
export default function NavigationButtons() {
  const colors = ["inherit", "#1976d2"];
  const [index, setIndex] = React.useState(0);
  return (
    <React.Fragment>
      <Button
        onClick={() => {
          history.push("/data-entry");
          setIndex(0);
        }}
        style={{
          backgroundColor: index === 0 ? colors[1] : colors[0],
        }}
      >
        <Translate id="appBar.dataEntry" />
      </Button>
      <Button
        onClick={() => {
          history.push("/goals");
          setIndex(1);
        }}
        style={{
          backgroundColor: index === 1 ? colors[1] : colors[0],
        }}
      >
        <Translate id="appBar.dataCleanup" />
      </Button>
    </React.Fragment>
  );
}
