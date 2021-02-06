import { deleteLift, downloadLift, exportLift } from "backend";
import { StoreStateDispatch } from "types/actions";

export enum ExportStatus {
  Default = "DEFAULT",
  InProgress = "IN_PROGRESS",
  Success = "SUCCESS",
  Failure = "FAILURE",
}

export interface ExportProjectAction {
  type: ExportStatus;
  projectId?: string;
}

export function asyncExportProject(projectId: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(inProgress(projectId));
    exportLift(projectId).catch(() => {
      dispatch(failure(projectId));
    });
  };
}

export function downloadIsReady(projectId: string) {
  return (dispatch: StoreStateDispatch) => {
    dispatch(success(projectId));
  };
}

export function asyncDownloadExport(projectId: string) {
  return async (dispatch: StoreStateDispatch) => {
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

function inProgress(projectId: string): ExportProjectAction {
  return {
    type: ExportStatus.InProgress,
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
