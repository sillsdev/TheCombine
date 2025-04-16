import { type ReactElement } from "react";

import SignalRHub from "components/App/SignalRHub";
import {
  failure,
  success,
} from "goals/MergeDuplicates/FindDups/Redux/FindDupsActions";
import { FindDupsStatus } from "goals/MergeDuplicates/FindDups/Redux/FindDupsReduxTypes";
import { asyncLoadNewGoalData } from "goals/Redux/GoalActions";
import { useAppSelector } from "rootRedux/hooks";
import { StoreStateDispatch, type StoreState } from "rootRedux/types";

export default function ExportHub(): ReactElement {
  const status = useAppSelector(
    (state: StoreState) => state.findDupsState.status
  );

  const successAction = async (dispatch: StoreStateDispatch): Promise<void> => {
    dispatch(success());
    await dispatch(asyncLoadNewGoalData());
  };

  return (
    <SignalRHub
      connect={status === FindDupsStatus.InProgress}
      failure="DuplicateFinderFailed"
      failureAction={failure()}
      success="DuplicatesReady"
      successAction={successAction}
      url="merge-hub"
    />
  );
}
