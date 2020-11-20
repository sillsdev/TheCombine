import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RuntimeConfig } from "../../types/runtimeConfig";
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
        const baseUrl = RuntimeConfig.getInstance().baseUrl();
        const newConnection = new HubConnectionBuilder()
          .withUrl(`${baseUrl}/hub`)
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
      const method = (userId: string) => {
        if (userId === getUserId()) {
          downloadIsReady(exportState.projectId)(dispatch);
          connection.stop();
        }
      };
      connection
        .start()
        .then(() => connection.on("DownloadReady", method))
        .catch((err) => console.error(err));
    }
  }, [connection, dispatch, exportState]);

  return <React.Fragment />;
}
