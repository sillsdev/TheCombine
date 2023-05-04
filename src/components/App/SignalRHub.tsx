import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import React, { useEffect, useState } from "react";

import { baseURL } from "backend";
import { getUserId } from "backend/localStorage";
import {
  downloadIsReady,
  failure,
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
      // Name must match what is in Backend/Helper/CombineHub.cs.
      const failName = "ExportFailed";
      const successName = "DownloadReady";

      // The method is what the frontend does upon message receipt.
      const failMethod = (userId: string) => {
        if (userId === getUserId()) {
          dispatch(failure(exportState.projectId));
          // After dispatch, stop the connection completely.
          // We don't need it active unless a new export is started,
          // and that might be with a different projectId.
          connection.stop();
        }
      };
      const successMethod = (userId: string) => {
        if (userId === getUserId()) {
          dispatch(downloadIsReady(exportState.projectId));
          // After dispatch, stop the connection completely.
          // We don't need it active unless a new export is started,
          // and that might be with a different projectId.
          connection.stop();
        }
      };

      connection.start().then(() => {
        connection.on(failName, failMethod);
        connection.on(successName, successMethod);
      });
    }
    // We reference dispatch and exportState, but they're not dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection]);

  return <React.Fragment />;
}
