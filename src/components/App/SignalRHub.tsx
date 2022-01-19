import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { baseURL } from "backend";
import { getUserId } from "backend/localStorage";
import { downloadIsReady } from "components/ProjectExport/Redux/ExportProjectActions";
import { ExportStatus } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { StoreState } from "types";

/** A central hub for monitoring export status on SignalR */
export default function SignalRHub() {
  const exportState = useSelector(
    (state: StoreState) => state.exportProjectState
  );
  const dispatch = useDispatch();
  const [connection, setConnection] = useState<HubConnection | undefined>();

  useEffect(() => {
    if (connection) {
      connection.stop();
    }
    setConnection(undefined);
    if (exportState.status === ExportStatus.Exporting) {
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
      // The methodName must match what is in Backend/Helper/CombineHub.cs.
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
        .catch(console.error);
    }
    // We reference dispatch and exportState, but they're not dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection]);

  return <React.Fragment />;
}
