import { type ReactElement, useCallback, useEffect, useRef } from "react";

import { getRequestStatus } from "backend";
import SignalRHub from "components/App/SignalRHub";
import {
  asyncLoadNewGoalData,
  setDataLoadStatus,
  setMergeRequestId,
} from "goals/Redux/GoalActions";
import { DataLoadStatus } from "goals/Redux/GoalReduxTypes";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { StoreStateDispatch, type StoreState } from "rootRedux/types";

/** SignalRHub for the Merge Dups tool's duplicate finding. */
export default function MergeHub(): ReactElement {
  const dispatch = useAppDispatch();
  const status = useAppSelector(
    (state: StoreState) => state.goalsState.dataLoadStatus
  );
  const requestId = useAppSelector(
    (state: StoreState) => state.goalsState.mergeRequestId
  );
  const pollingIntervalRef = useRef<NodeJS.Timeout | undefined>();

  /** Update the Redux state and trigger continuation of goal loading. */
  const successAction = async (dispatch: StoreStateDispatch): Promise<void> => {
    dispatch(setDataLoadStatus(DataLoadStatus.Success));
    dispatch(setMergeRequestId(undefined)); // Clear requestId after success
    await dispatch(asyncLoadNewGoalData()).then(() =>
      setDataLoadStatus(DataLoadStatus.Default)
    );
  };

  /** Fallback polling when SignalR times out or fails. */
  const handleTimeout = useCallback(
    async (dispatch: StoreStateDispatch): Promise<void> => {
      if (!requestId) {
        console.error("No requestId available for fallback polling");
        dispatch(setDataLoadStatus(DataLoadStatus.Failure));
        return;
      }

      console.log("SignalR timeout - starting fallback HTTP polling");

      // Start polling every 2 seconds
      const pollStatus = async (): Promise<void> => {
        try {
          const result = await getRequestStatus(requestId);
          if (result === true) {
            // Success - data is ready
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = undefined;
            }
            await successAction(dispatch);
          } else if (result === false) {
            // Failure
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = undefined;
            }
            dispatch(setDataLoadStatus(DataLoadStatus.Failure));
            dispatch(setMergeRequestId(undefined));
          }
          // If result is null, keep polling
        } catch (error) {
          console.error("Error polling request status:", error);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = undefined;
          }
          dispatch(setDataLoadStatus(DataLoadStatus.Failure));
          dispatch(setMergeRequestId(undefined));
        }
      };

      // Poll immediately, then every 2 seconds
      await pollStatus();
      if (status === DataLoadStatus.Loading) {
        pollingIntervalRef.current = setInterval(pollStatus, 2000);
      }
    },
    [dispatch, requestId, status]
  );

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return (
    <SignalRHub
      connect={status === DataLoadStatus.Loading}
      failureAction={setDataLoadStatus(DataLoadStatus.Failure)}
      requestId={requestId}
      successAction={successAction}
      timeoutAction={handleTimeout}
      timeout={30000}
      url="merge-hub" // MergeHub.Url
    />
  );
}
