import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from "@microsoft/signalr";
import { Action, PayloadAction, ThunkAction } from "@reduxjs/toolkit";
import {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";

import { baseURL } from "backend";
import { getUserId } from "backend/localStorage";
import { useAppDispatch } from "rootRedux/hooks";

type MethodAction = Action | PayloadAction | ThunkAction<any, any, any, any>;

interface SignalRHubProps {
  /** Trigger (dis)connection. */
  connect: boolean;
  /** To be dispatched for the failure method. */
  failureAction?: MethodAction;
  /** To be dispatched for the success method. */
  successAction: MethodAction;
  /** Must match `*Hub.Url` in Backend/Helper/CombineHub.cs */
  url: string;
}

/** Matches `CombineHub.MethodFailure` in Backend/Helper/CombineHub.cs */
const failureMethodName = "Failure";
/** Matches `CombineHub.MethodSuccess` in Backend/Helper/CombineHub.cs */
const successMethodName = "Success";
/** Matches `CombineHub.AcknowledgeMessage` in Backend/Helper/CombineHub.cs */
const acknowledgeMethodName = "AcknowledgeMessage";

/** A central hub for monitoring export status on SignalR */
export default function SignalRHub(props: SignalRHubProps): ReactElement {
  const { connect, failureAction, successAction, url } = props;

  const dispatch = useAppDispatch();

  const [connection, setConnection] = useState<HubConnection | undefined>();
  const [disconnect, setDisconnect] = useState(false);
  const [reconnect, setReconnect] = useState(false);

  const finishDisconnect = useCallback((): void => {
    setConnection(undefined);
    setDisconnect(false);
  }, []);

  /* Act on the disconnect state to stop and delete the connection. */
  useEffect(() => {
    if (disconnect) {
      if (connection) {
        connection.stop().then(finishDisconnect).catch(finishDisconnect);
      } else {
        setDisconnect(false);
      }
    }
  }, [connection, disconnect, finishDisconnect]);

  /* Once disconnect state is acted on, act on the reconnect state. */
  useEffect(() => {
    if (!disconnect && reconnect) {
      const newConnection = new HubConnectionBuilder()
        .withUrl(`${baseURL}/${url}`)
        .withAutomaticReconnect()
        .build();
      setReconnect(false);
      setConnection(newConnection);
    }
  }, [disconnect, reconnect, url]);

  /* Trigger a reconnect when connect is true and disconnect otherwise. */
  useEffect(() => {
    setDisconnect(true);
    setReconnect(connect);
  }, [connect]);

  /** Handler used by connection.on for when the failure method is invoked. */
  const failureMethod = useCallback(
    (userId: string): void => {
      if (failureAction && userId === getUserId()) {
        dispatch(failureAction);
      }
    },
    [dispatch, failureAction]
  );

  /** Handler used by connection.on for when the success method is invoked. */
  const successMethod = useCallback(
    async (userId: string, requestId: string): Promise<void> => {
      if (userId === getUserId()) {
        // Send acknowledgment to the server
        try {
          await connection!.invoke(acknowledgeMethodName, requestId);
        } catch (error) {
          console.warn("Failed to send acknowledgment:", error);
        }

        dispatch(successAction);
      }
    },
    [connection, dispatch, successAction]
  );

  /* Once a connection is opened, register the method handlers. */
  useEffect(() => {
    if (connection?.state !== HubConnectionState.Disconnected) {
      return;
    }

    connection.start().then(() => {
      connection.on(failureMethodName, failureMethod);
      connection.on(successMethodName, successMethod);
    });
  }, [connection, failureMethod, successMethod]);

  return <Fragment />;
}
