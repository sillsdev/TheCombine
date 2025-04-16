import { Action, PayloadAction } from "@reduxjs/toolkit";

import { deleteLift, exportLift } from "backend";
import {
  failureAction,
  inProgressAction,
  resetFindDupsAction,
  successAction,
} from "goals/MergeDuplicates/FindDups/Redux/FindDupsReducer.ts";
import { StoreStateDispatch } from "rootRedux/types";

// Action Creation Functions

export function inProgress(projectId: string): PayloadAction {
  return inProgressAction(projectId);
}

export function failure(projectId: string): PayloadAction {
  return failureAction(projectId);
}

export function resetFindDups(): Action {
  return resetFindDupsAction();
}

export function success(projectId: string): PayloadAction {
  return successAction(projectId);
}

// Dispatch Functions

export function asyncFindDups(projectId: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(inProgress(projectId));
    await exportLift(projectId).catch(() => dispatch(failure(projectId)));
  };
}

export function asyncResetFindDups() {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(resetFindDups());
    await deleteLift();
  };
}
