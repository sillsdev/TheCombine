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
  const status = useAppSelector(
    (state: StoreState) => state.findDupsState.status
  );

  return (
    <SignalRHub
      connect={status === FindDupsStatus.InProgress}
      failure="DuplicateFinderFailed"
      failureAction={failure()}
      success="DuplicatesReady"
      successAction={success()}
      url="merge-hub"
    />
  );
}
