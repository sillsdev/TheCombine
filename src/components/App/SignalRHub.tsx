import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { baseURL } from "../../backend";
import { getUserId } from "../../backend/localStorage";
import { StoreState } from "../../types";
import {
  downloadIsReady,
  ExportStatus,
} from "../ProjectExport/ExportProjectActions";

/** A central hub for monitoring export status on SignalR */
export default function SignalRHub() {
  const exportState = useSelector(
    (state: StoreState) => state.exportProjectState
  );
  const dispatch = useDispatch();
  const [connection, setConnection] = useState<null | HubConnection>(null);

  useEffect(() => {
    if (connection) {
      connection.stop();
    }
    setConnection(null);
    if (exportState.status === ExportStatus.InProgress) {
      const newConnection = new HubConnectionBuilder()
        .withUrl(`${baseURL}/hub`)
        .withAutomaticReconnect()
        .build();
      setConnection(newConnection);
    }
    // We reference connection, but don't want it in the dependency list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportState]);

  useEffect(() => {
    if (connection) {
      // The methodName must match what is used by the Backend in, e.g.,
      // `_notifyService.Clients.All.SendAsync("DownloadReady", userId);`.
      const methodName = "DownloadReady";
      // The method is what the frontend does upon message receipt.
      const method = (userId: string) => {
        if (userId === getUserId()) {
          downloadIsReady(exportState.projectId)(dispatch);
          // After dispatch, stop the connection completely.
          // We don't need it active unless a new export is started,
          // and that might be with a different projectId.
          connection.stop();
        }
      };
      connection
        .start()
        .then(() => connection.on(methodName, method))
        .catch((err) => console.error(err));
    }
    // We reference dispatch and exportState, but they're not dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection]);

  return <React.Fragment />;
}
