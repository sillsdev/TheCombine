import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from "@microsoft/signalr";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

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
          .withUrl("https://localhost:5001/hub")
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
      const methodName = "DownloadReady";
      const method = (userId: string) => {
        if (userId === getUserId()) {
          downloadIsReady(exportState.projectId)(dispatch);
          methodOff();
        }
      };
      const methodOn = () => connection.on(methodName, method);
      const methodOff = () => connection.off(methodName);
      const start = () => {
        connection
          .start()
          .then(methodOn)
          .catch((err) => console.error(err));
      };
      if (connection.state === HubConnectionState.Disconnected) {
        start();
      } else if (connection.state === HubConnectionState.Disconnecting) {
        connection.onclose(start);
      } else if (connection.state === HubConnectionState.Reconnecting) {
        connection.onreconnected(start);
      } else {
        methodOff();
        methodOn();
      }
    }
  }, [connection, dispatch, exportState]);

  return <React.Fragment />;
}
