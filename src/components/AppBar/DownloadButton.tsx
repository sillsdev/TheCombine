import { IconButton, Tooltip } from "@material-ui/core";
import { GetApp } from "@material-ui/icons";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import React, { useEffect } from "react";
import { Translate } from "react-localize-redux";

/** An app bar shown at the top of almost every page of The Combine */
export function DownloadButton() {
  const [connection, setConnection] = React.useState<null | HubConnection>(
    null
  );
  const [received, setReceived] = React.useState<string>("");

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:5001/queue")
      .withAutomaticReconnect()
      .build();
    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected!");
          connection.on("ReceiveMessage", (user: string, message: string) => {
            setReceived(`${user}: ${message}`);
          });
        })
        .catch((e) => console.log("Connection failed: ", e));
    }
  }, [connection]);

  function download() {
    setReceived("");
  }

  return (
      <React.Fragment>
       {received &&
      <Tooltip title={<Translate id="appBar.downloadReady" />} placement="bottom">
        <IconButton tabIndex={-1} onClick={download}>
          <GetApp />
        </IconButton>
      </Tooltip>}
      </React.Fragment>
    );
  };

export default React.memo<{}>(DownloadButton);