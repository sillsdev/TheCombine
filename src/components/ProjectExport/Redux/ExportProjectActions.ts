import { deleteLift, downloadLift, exportLift } from "backend";
import {
  ExportProjectAction,
  ExportStatus,
} from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { StoreStateDispatch } from "types/Redux/actions";

export function asyncExportProject(projectId: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(exporting(projectId));
    exportLift(projectId).catch(() => dispatch(failure(projectId)));
  };
}

export function downloadIsReady(projectId: string) {
  return (dispatch: StoreStateDispatch) => dispatch(success(projectId));
}

export function asyncDownloadExport(projectId: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(downloading(projectId));
    return await downloadLift(projectId).catch(() => {
      dispatch(failure(projectId));
    });
  };
}

export function resetExport(projectId?: string) {
  return (dispatch: StoreStateDispatch) => {
    dispatch(reset());
    deleteLift(projectId);
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
function success(projectId: string): ExportProjectAction {
  return {
    type: ExportStatus.Success,
    projectId,
  };
}
function failure(projectId: string): ExportProjectAction {
  return {
    type: ExportStatus.Failure,
    projectId,
  };
}
function reset(): ExportProjectAction {
  return { type: ExportStatus.Default };
}
