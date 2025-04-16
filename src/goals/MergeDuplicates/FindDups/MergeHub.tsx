import { type ReactElement } from "react";

import SignalRHub from "components/App/SignalRHub";
import {
  failure,
  success,
} from "goals/MergeDuplicates/FindDups/Redux/FindDupsActions";
import { FindDupsStatus } from "goals/MergeDuplicates/FindDups/Redux/FindDupsReduxTypes";
import { useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";

export default function ExportHub(): ReactElement {
  const findDupsState = useAppSelector(
    (state: StoreState) => state.findDuplicates
  );

  return (
    <SignalRHub
      connect={findDupsState.status === FindDupsStatus.InProgress}
      failure="DuplicateFinderFailed"
      failureAction={failure(findDupsState.projectId)}
      success="DuplicatesReady"
      successAction={success(findDupsState.projectId)}
      url="merge-hub"
    />
  );
}
