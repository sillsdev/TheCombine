import { type ReactElement } from "react";

import SignalRHub from "components/App/SignalRHub";
import {
  failure,
  success,
} from "components/ProjectExport/Redux/ExportProjectActions";
import { ExportStatus } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";

export default function ExportHub(): ReactElement {
  const exportState = useAppSelector(
    (state: StoreState) => state.exportProjectState
  );

  return (
    <SignalRHub
      connect={exportState.status === ExportStatus.Exporting}
      failure="ExportFailed"
      failureAction={failure(exportState.projectId)}
      success="DownloadReady"
      successAction={success(exportState.projectId)}
      url="export-hub"
    />
  );
}
