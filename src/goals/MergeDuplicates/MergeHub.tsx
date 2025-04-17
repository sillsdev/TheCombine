import { type ReactElement } from "react";

import SignalRHub from "components/App/SignalRHub";
import {
  asyncLoadNewGoalData,
  setDataLoadStatus,
} from "goals/Redux/GoalActions";
import { DataLoadStatus } from "goals/Redux/GoalReduxTypes";
import { useAppSelector } from "rootRedux/hooks";
import { StoreStateDispatch, type StoreState } from "rootRedux/types";

/** SignalRHub for the Merge Dups tool's duplicate finding. */
export default function MergeHub(): ReactElement {
  const status = useAppSelector(
    (state: StoreState) => state.goalsState.dataLoadStatus
  );

  /** Update the Redux state and trigger continuation of goal loading. */
  const successAction = async (dispatch: StoreStateDispatch): Promise<void> => {
    dispatch(setDataLoadStatus(DataLoadStatus.Success));
    await dispatch(asyncLoadNewGoalData()).then(() =>
      setDataLoadStatus(DataLoadStatus.Default)
    );
  };

  return (
    <SignalRHub
      connect={status === DataLoadStatus.Loading}
      failure="DuplicateFinderFailed"
      failureAction={setDataLoadStatus(DataLoadStatus.Failure)}
      success="DuplicatesReady"
      successAction={successAction}
      url="merge-hub"
    />
  );
}
