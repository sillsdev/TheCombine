import { ThunkDispatch } from "redux-thunk";

import { deleteLift, downloadLift, exportLift } from "../../backend";
import { StoreState } from "../../types";

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
  return async (
    dispatch: ThunkDispatch<StoreState, any, ExportProjectAction>
  ) => {
    dispatch(inProgress(projectId));
    exportLift(projectId).catch(() => {
      dispatch(failure(projectId));
    });
  };
}

export function downloadIsReady(projectId: string) {
  return (dispatch: ThunkDispatch<StoreState, any, ExportProjectAction>) => {
    dispatch(success(projectId));
  };
}

export function asyncDownloadExport(projectId: string) {
  return async (
    dispatch: ThunkDispatch<StoreState, any, ExportProjectAction>
  ) => {
    return await downloadLift(projectId).catch(() => {
      dispatch(failure(projectId));
    });
  };
}

export function resetExport(projectId?: string) {
  return (dispatch: ThunkDispatch<StoreState, any, ExportProjectAction>) => {
    dispatch(reset());
    deleteLift(projectId);
  };
}

export function inProgress(projectId: string): ExportProjectAction {
  return {
    type: ExportStatus.InProgress,
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

export function reset(): ExportProjectAction {
  return { type: ExportStatus.Default };
}
