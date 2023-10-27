import { Action, PayloadAction } from "@reduxjs/toolkit";

import { deleteLift, downloadLift, exportLift } from "backend";
import {
  downloadingAction,
  exportingAction,
  failureAction,
  resetAction,
  successAction,
} from "components/ProjectExport/Redux//ExportProjectReducer";
import { StoreStateDispatch } from "types/Redux/actions";

// Action Creation Functions

export function exporting(projectId: string): PayloadAction {
  return exportingAction(projectId);
}

export function downloading(projectId: string): PayloadAction {
  return downloadingAction(projectId);
}

export function failure(projectId: string): PayloadAction {
  return failureAction(projectId);
}

export function reset(): Action {
  return resetAction();
}

export function success(projectId: string): PayloadAction {
  return successAction(projectId);
}

// Dispatch Functions

export function asyncExportProject(projectId: string) {
  return async (dispatch: StoreStateDispatch) => {
    console.info("dispatching export");
    dispatch(exporting(projectId));
    console.info("exporting");
    await exportLift(projectId).catch(() => dispatch(failure(projectId)));
    console.info("exported");
  };
}

export function asyncDownloadExport(projectId: string) {
  return async (dispatch: StoreStateDispatch) => {
    console.info("dispatching download");
    dispatch(downloading(projectId));
    console.info("downloading");
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
