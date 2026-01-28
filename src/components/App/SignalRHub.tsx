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
  /** Request ID for tracking the operation. */
  requestId?: string;
  /** To be dispatched for the success method. */
  successAction: MethodAction;
  /** Callback for timeout scenario. */
  timeoutAction?: MethodAction;
  /** Timeout in milliseconds (default: 30000). */
  timeout?: number;
  /** Must match `*Hub.Url` in Backend/Helper/CombineHub.cs */
  url: string;
}

/** Matches `CombineHub.MethodFailure` in Backend/Helper/CombineHub.cs */
const failureMethodName = "Failure";
/** Matches `CombineHub.MethodSuccess` in Backend/Helper/CombineHub.cs */
const successMethodName = "Success";
/** Matches `CombineHub.MethodAcknowledge` in Backend/Helper/CombineHub.cs */
const acknowledgeMethodName = "AcknowledgeMessage";

/** A central hub for monitoring export status on SignalR */
export default function SignalRHub(props: SignalRHubProps): ReactElement {
  const {
    connect,
    failureAction,
    requestId,
    successAction,
    timeoutAction,
    timeout = 30000,
    url,
  } = props;

  const dispatch = useAppDispatch();

  const [connection, setConnection] = useState<HubConnection | undefined>();
  const [disconnect, setDisconnect] = useState(false);
  const [reconnect, setReconnect] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>();

  const finishDisconnect = useCallback((): void => {
    setConnection(undefined);
    setDisconnect(false);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(undefined);
    }
  }, [timeoutId]);

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
    async (userId: string, receivedRequestId?: string): Promise<void> => {
      if (userId === getUserId()) {
        // Clear timeout when we receive a success message
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(undefined);
        }

        // Send acknowledgment to the server
        if (connection && receivedRequestId) {
          try {
            await connection.invoke(acknowledgeMethodName, receivedRequestId);
          } catch (error) {
            console.warn("Failed to send acknowledgment:", error);
          }
        }

        dispatch(successAction);
      }
    },
    [connection, dispatch, successAction, timeoutId]
  );

  /* Once a connection is opened, register the method handlers. */
  useEffect(() => {
    if (connection?.state !== HubConnectionState.Disconnected) {
      return;
    }

    connection.start().then(() => {
      connection.on(failureMethodName, failureMethod);
      connection.on(successMethodName, successMethod);

      // Start timeout timer when connection is established and we have a requestId
      if (requestId && timeoutAction && connect) {
        const id = setTimeout(() => {
          console.warn(
            "SignalR timeout: No response received within",
            timeout,
            "ms"
          );
          dispatch(timeoutAction);
        }, timeout);
        setTimeoutId(id);
      }
    });
  }, [
    connection,
    connect,
    dispatch,
    failureMethod,
    requestId,
    successMethod,
    timeout,
    timeoutAction,
  ]);

  return <Fragment />;
}
