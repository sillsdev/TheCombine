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
  connect: boolean;
  /** Must match what is in Backend/Helper/CombineHub.cs */
  failure: string;
  failureAction?: MethodAction;
  /** Must match what is in Backend/Helper/CombineHub.cs */
  success: string;
  successAction: MethodAction;
  /** Must match what is in Backend/Helper/CombineHub.cs */
  url: string;
}

/** A central hub for monitoring export status on SignalR */
export default function SignalRHub(props: SignalRHubProps): ReactElement {
  const { connect, failure, failureAction, success, successAction, url } =
    props;

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
    if (connect) {
      setReconnect(true);
    }
  }, [connect]);

  /** Method used by connection.on upon receipt of failure message. */
  const failureMethod = useCallback(
    (userId: string): void => {
      if (failureAction && userId === getUserId()) {
        dispatch(failureAction);
      }
    },
    [dispatch, failureAction]
  );

  /** Method used by connection.on upon receipt of success message. */
  const successMethod = useCallback(
    (userId: string): void => {
      if (userId === getUserId()) {
        dispatch(successAction);
      }
    },
    [dispatch, successAction]
  );

  /* Once a connection is opened, start the relevant methods. */
  useEffect(() => {
    if (connection?.state !== HubConnectionState.Disconnected) {
      return;
    }

    connection.start().then(() => {
      connection.on(failure, failureMethod);
      connection.on(success, successMethod);
    });
  }, [connection, failure, failureMethod, success, successMethod]);

  return <Fragment />;
}
