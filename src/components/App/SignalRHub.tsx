import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import React, { useEffect } from "react";
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

  const [connection, setConnection] = React.useState<null | HubConnection>(
    null
  );

  useEffect(() => {
    switch (exportState.status) {
      case ExportStatus.InProgress: {
        const newConnection = new HubConnectionBuilder()
          .withUrl(`${baseURL}/hub`)
          .withAutomaticReconnect()
          .build();
        setConnection(newConnection);
        break;
      }
      default: {
        setConnection(null);
        break;
      }
    }
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
  }, [connection, dispatch, exportState]);

  return <React.Fragment />;
}
