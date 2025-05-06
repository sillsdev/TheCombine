import { type ReactElement } from "react";

import SignalRHub from "components/App/SignalRHub";
import {
  failure,
  success,
} from "components/ProjectExport/Redux/ExportProjectActions";
import { ExportStatus } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";

/** SignalRHub for exporting a project and preparing the download. */
export default function ExportHub(): ReactElement {
  const { projectId, status } = useAppSelector(
    (state: StoreState) => state.exportProjectState
  );

  return (
    <SignalRHub
      connect={status === ExportStatus.Exporting}
      failureAction={failure(projectId)}
      successAction={success(projectId)}
      url="export-hub" // ExportHub.Url
    />
  );
}
