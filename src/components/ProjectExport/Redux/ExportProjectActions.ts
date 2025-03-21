import { Action, PayloadAction } from "@reduxjs/toolkit";

import { deleteLift, downloadLift, exportLift } from "backend";
import {
  cancelingAction,
  downloadingAction,
  exportingAction,
  failureAction,
  resetExportAction,
  successAction,
} from "components/ProjectExport/Redux//ExportProjectReducer";
import { StoreStateDispatch } from "rootRedux/types";

// Action Creation Functions
export function canceling(projectId: string): PayloadAction {
  return cancelingAction(projectId);
}

export function exporting(projectId: string): PayloadAction {
  return exportingAction(projectId);
}

export function downloading(projectId: string): PayloadAction {
  return downloadingAction(projectId);
}

export function failure(projectId: string): PayloadAction {
  return failureAction(projectId);
}

export function resetExport(): Action {
  return resetExportAction();
}

export function success(projectId: string): PayloadAction {
  return successAction(projectId);
}

// Dispatch Functions
// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function asyncExportProject(projectId: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(exporting(projectId));
    // console.log("sleeping");
    // await sleep(5000);
    await exportLift(projectId).catch(() => dispatch(failure(projectId)));
  };
}

export function asyncCancelExport(projectId: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(canceling(projectId));
    await asyncCancelExport(projectId);
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
    dispatch(resetExport());
    await deleteLift();
  };
}
