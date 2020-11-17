import { IconButton, Tooltip } from "@material-ui/core";
import { GetApp } from "@material-ui/icons";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import React, { useEffect } from "react";
//import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import { StoreState } from "../../types";
import { ExportStatus } from "../ProjectSettings/ProjectExport/ExportProjectActions";

/** An app bar shown at the top of almost every page of The Combine */
export default function DownloadButton() {
  const exportState = useSelector(
    (state: StoreState) => state.exportProjectState
  );
  const [connection, setConnection] = React.useState<null | HubConnection>(
    null
  );
  const [received, setReceived] = React.useState<string>("");

  useEffect(() => {
    switch (exportState.status) {
      case ExportStatus.InProgress: {
        const newConnection = new HubConnectionBuilder()
          .withUrl("https://localhost:5001/queue")
          .withAutomaticReconnect()
          .build();
        setConnection(newConnection);
        break;
      }
      case ExportStatus.Failure: {
        setConnection(null);
        setReceived("export failed");
        break;
      }
      case ExportStatus.Success: {
        setConnection(null);
        setReceived("export succeeded");
        break;
      }
      case ExportStatus.Default: {
        setConnection(null);
        setReceived("no active export");
        break;
      }
    }
  }, [exportState]);

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
      {received && (
        <Tooltip
          title={received} //<Translate id="appBar.downloadReady" />}
          placement="bottom"
        >
          <IconButton tabIndex={-1} onClick={download}>
            <GetApp />
          </IconButton>
        </Tooltip>
      )}
    </React.Fragment>
  );
}
