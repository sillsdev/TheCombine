import { IconButton, Tooltip } from "@material-ui/core";
import { Cached, Error, GetApp } from "@material-ui/icons";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import React, { useEffect } from "react";
//import { Translate } from "react-localize-redux";
import { useDispatch, useSelector } from "react-redux";

import { getProjectName } from "../../backend";
import { StoreState } from "../../types";
import { getNowDateTimeString } from "../../utilities";
import { asyncDownloadExport, ExportStatus } from "./ExportProjectActions";

/** An app bar shown at the top of almost every page of The Combine */
export default function DownloadButton() {
  const exportState = useSelector(
    (state: StoreState) => state.exportProjectState
  );
  const dispatch = useDispatch();

  const [connection, setConnection] = React.useState<null | HubConnection>(
    null
  );
  const [received, setReceived] = React.useState<string>("");
  const [fileName, setFileName] = React.useState<null | string>(null);
  const [fileUrl, setFileUrl] = React.useState<null | string>(null);
  let downloadLink = React.createRef<HTMLAnchorElement>();

  useEffect(() => {
    switch (exportState.status) {
      case ExportStatus.InProgress: {
        const newConnection = new HubConnectionBuilder()
          .withUrl("https://localhost:5001/queue")
          .withAutomaticReconnect()
          .build();
        setConnection(newConnection);
        setReceived("export in progress");
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

  useEffect(() => {
    if (downloadLink.current && fileUrl !== null) {
      downloadLink.current.click();
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
  }, [downloadLink, fileUrl]);

  async function download() {
    setReceived("");

    const projectName = await getProjectName(exportState.projectId);
    setFileName(`${projectName}_${getNowDateTimeString()}.zip`);
    asyncDownloadExport(exportState.projectId)(dispatch)
      .then((file) => {
        if (file) {
          setFileUrl(URL.createObjectURL(file));
        }
      })
      .catch((err) => console.error(err));
  }

  return (
    <React.Fragment>
      {exportState.status !== ExportStatus.Default && (
        <Tooltip
          title={received} //<Translate id="appBar.downloadReady" />}
          placement="bottom"
        >
          <IconButton tabIndex={-1} onClick={download}>
            {exportState.status === ExportStatus.InProgress && <Cached />}
            {exportState.status === ExportStatus.Success && <GetApp />}
            {exportState.status === ExportStatus.Failure && <Error />}
          </IconButton>
        </Tooltip>
      )}
      {fileUrl && (
        <a
          ref={downloadLink}
          href={fileUrl}
          download={fileName}
          style={{ display: "none" }}
        >
          (This link should not be visible)
        </a>
      )}
    </React.Fragment>
  );
}
