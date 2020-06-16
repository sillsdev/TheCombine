import React, { useState } from "react";
import { Button} from "@material-ui/core";
import history from "../../history";
import { Translate } from "react-localize-redux";

/** A button that redirects to the home page */
export default function NavigationButtons() {
  const highlight: string = "#1976d2";
  const colors = ["inherit", highlight];
  const [page, setPage] = useState(history.location.pathname);
  return (
    <React.Fragment>
      <Button
        onClick={() => {
          history.push("/data-entry");
          setPage("/data-entry");
        }}
        color={"inherit"}
        style={{
          background: page === "/data-entry" ? colors[1] : colors[0],
        }}
      >
        <Translate id="appBar.dataEntry" />
      </Button>
      <Button
        onClick={() => {
          history.push("/goals");
          setPage("/goals");
        }}
        color={"inherit"}
        style={{
          background: page === "/goals" ? colors[1] : colors[0],
        }}
      >
        <Translate id="appBar.dataCleanup" />
      </Button>
    </React.Fragment>
  );
}
