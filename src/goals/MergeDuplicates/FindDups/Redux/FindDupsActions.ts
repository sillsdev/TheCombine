import { Action } from "@reduxjs/toolkit";

import { findDuplicates } from "backend";
import {
  failureAction,
  inProgressAction,
  resetFindDupsAction,
  successAction,
} from "goals/MergeDuplicates/FindDups/Redux/FindDupsReducer";
import { StoreStateDispatch } from "rootRedux/types";

// Action Creation Functions

export function inProgress(): Action {
  return inProgressAction();
}

export function failure(): Action {
  return failureAction();
}

export function resetFindDups(): Action {
  return resetFindDupsAction();
}

export function success(): Action {
  return successAction();
}

// Dispatch Functions

export function asyncFindDups(maxInList: number, maxLists: number) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(inProgress());
    await findDuplicates(maxInList, maxLists).catch(() => dispatch(failure()));
  };
}
