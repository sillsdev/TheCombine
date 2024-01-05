import { Action, PayloadAction } from "@reduxjs/toolkit";

import { Word } from "api/models";
import * as backend from "backend";
import {
  addCompletedMergeToGoal,
  asyncUpdateGoal,
} from "components/GoalTimeline/Redux/GoalActions";
import {
  defaultSidebar,
  MergeTreeReference,
  Sidebar,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import {
  MergeDups,
  MergeStepData,
  ReviewDeferredDups,
} from "goals/MergeDuplicates/MergeDupsTypes";
import {
  clearMergeWordsAction,
  clearTreeAction,
  combineSenseAction,
  deleteSenseAction,
  flagWordAction,
  getMergeWordsAction,
  moveDuplicateAction,
  moveSenseAction,
  orderDuplicateAction,
  orderSenseAction,
  setDataAction,
  setSidebarAction,
  setVernacularAction,
} from "goals/MergeDuplicates/Redux/MergeDupsReducer";
import {
  CombineSenseMergePayload,
  FlagWordPayload,
  MoveSensePayload,
  OrderSensePayload,
  SetVernacularPayload,
} from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

// Action Creation Functions

export function clearMergeWords(): Action {
  return clearMergeWordsAction();
}

export function clearTree(): Action {
  return clearTreeAction();
}

export function combineSense(payload: CombineSenseMergePayload): PayloadAction {
  return combineSenseAction(payload);
}

export function deleteSense(payload: MergeTreeReference): PayloadAction {
  return deleteSenseAction(payload);
}

export function flagWord(payload: FlagWordPayload): PayloadAction {
  return flagWordAction(payload);
}

export function getMergeWords(): Action {
  return getMergeWordsAction();
}

export function moveSense(payload: MoveSensePayload): PayloadAction {
  if (payload.src.order === undefined) {
    return moveSenseAction(payload);
  } else {
    return moveDuplicateAction(payload);
  }
}

export function orderSense(payload: OrderSensePayload): PayloadAction {
  if (payload.src.order === undefined) {
    return orderSenseAction(payload);
  } else {
    return orderDuplicateAction(payload);
  }
}

export function setSidebar(sidebar?: Sidebar): PayloadAction {
  return setSidebarAction(sidebar ?? defaultSidebar);
}

export function setData(words: Word[]): PayloadAction {
  return setDataAction(words);
}

export function setVern(payload: SetVernacularPayload): PayloadAction {
  return setVernacularAction(payload);
}

// Dispatch Functions

export function deferMerge() {
  return async (_: StoreStateDispatch, getState: () => StoreState) => {
    const mergeTree = getState().mergeDuplicateGoal;
    await backend.graylistAdd(Object.keys(mergeTree.data.words));
  };
}

export function mergeAll() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    dispatch(getMergeWords());
    const mergeTree = getState().mergeDuplicateGoal;
    const mergeWordsArray = [...mergeTree.mergeWords];
    dispatch(clearMergeWords());
    let parentIds: string[] = [];
    if (mergeWordsArray.length) {
      parentIds = await backend.mergeWords(mergeWordsArray);
      const childIds = [
        ...new Set(
          mergeWordsArray.flatMap((m) => m.children).map((s) => s.srcWordId)
        ),
      ];
      const completedMerge = { childIds, parentIds };
      dispatch(addCompletedMergeToGoal(completedMerge));
      await dispatch(asyncUpdateGoal());
    }

    // Blacklist the set of words with updated ids.
    const mergedIds = mergeWordsArray.map((mw) => mw.parent.id);
    const unmergedIds = Object.keys(mergeTree.data.words).filter(
      (id) => !mergedIds.includes(id)
    );
    const blacklistIds = [...unmergedIds, ...parentIds];
    if (blacklistIds.length > 1) {
      await backend.blacklistAdd(blacklistIds);
    }
  };
}

// Used in MergeDups cases of GoalActions functions

export function dispatchMergeStepData(goal: MergeDups | ReviewDeferredDups) {
  return (dispatch: StoreStateDispatch) => {
    const stepData = goal.steps[goal.currentStep] as MergeStepData;
    if (stepData) {
      const stepWords = stepData.words ?? [];
      dispatch(setData(stepWords));
    }
  };
}
