import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from "@microsoft/signalr";
import React, { useCallback, useEffect, useState } from "react";

import { baseURL } from "backend";
import { getUserId } from "backend/localStorage";
import {
  failure,
  success,
} from "components/ProjectExport/Redux/ExportProjectActions";
import { ExportStatus } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";

/** A central hub for monitoring export status on SignalR */
export default function SignalRHub() {
  const exportState = useAppSelector(
    (state: StoreState) => state.exportProjectState
  );
  const dispatch = useAppDispatch();
  const [connection, setConnection] = useState<HubConnection | undefined>();
  const [disconnect, setDisconnect] = useState(false);
  const [reconnect, setReconnect] = useState(false);

  const forceDisconnect = useCallback(() => {
    setConnection(undefined);
    setDisconnect(false);
  }, [setConnection, setDisconnect]);

  /** Act on the disconnect state to stop and delete the connection. */
  useEffect(() => {
    if (disconnect) {
      if (connection) {
        connection.stop().then(forceDisconnect).catch(forceDisconnect);
      } else {
        setDisconnect(false);
      }
    }
  }, [connection, disconnect, forceDisconnect]);

  /** Once disconnect state is acted on, act on the reconnect state. */
  useEffect(() => {
    if (!disconnect && reconnect) {
      const newConnection = new HubConnectionBuilder()
        .withUrl(`${baseURL}/hub`)
        .withAutomaticReconnect()
        .build();
      setReconnect(false);
      setConnection(newConnection);
    }
  }, [disconnect, reconnect, setConnection, setReconnect]);

  /** Any change in exportState should cause a disconnect.
   * Only ExportStatus.Exporting should open a new connection.
   */
  useEffect(() => {
    setDisconnect(true);
    if (exportState.status === ExportStatus.Exporting) {
      setReconnect(true);
    }
  }, [exportState, setDisconnect, setReconnect]);

  /** Once a connection is opened, start the relevant methods. */
  useEffect(() => {
    if (connection?.state !== HubConnectionState.Disconnected) {
      return;
    }

    // Name must match what is in Backend/Helper/CombineHub.cs.
    const failName = "ExportFailed";
    const successName = "DownloadReady";

    // The method is what the frontend does upon message receipt.
    const failMethod = (userId: string) => {
      if (userId === getUserId()) {
        dispatch(failure(exportState.projectId));
      }
    };
    const successMethod = (userId: string) => {
      if (userId === getUserId()) {
        dispatch(success(exportState.projectId));
      }
    };

    connection.start().then(() => {
      connection.on(failName, failMethod);
      connection.on(successName, successMethod);
    });
  }, [connection, dispatch, exportState.projectId]);

  return <React.Fragment />;
}
