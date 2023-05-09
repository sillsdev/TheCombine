import { deleteLift, downloadLift, exportLift } from "backend";
import {
  ExportProjectAction,
  ExportStatus,
} from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { StoreStateDispatch } from "types/Redux/actions";

export function asyncExportProject(projectId: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(exporting(projectId));
    await exportLift(projectId).catch(() => dispatch(failure(projectId)));
  };
}

export function asyncDownloadExport(projectId: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(downloading(projectId));
    return await downloadLift(projectId).catch(() => {
      dispatch(failure(projectId));
    });
  };
}

export function asyncResetExport() {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(reset());
    await deleteLift();
  };
}

function exporting(projectId: string): ExportProjectAction {
  return {
    type: ExportStatus.Exporting,
    projectId,
  };
}
function downloading(projectId: string): ExportProjectAction {
  return {
    type: ExportStatus.Downloading,
    projectId,
  };
}
export function success(projectId: string): ExportProjectAction {
  return {
    type: ExportStatus.Success,
    projectId,
  };
}
export function failure(projectId: string): ExportProjectAction {
  return {
    type: ExportStatus.Failure,
    projectId,
  };
}
function reset(): ExportProjectAction {
  return { type: ExportStatus.Default };
}
