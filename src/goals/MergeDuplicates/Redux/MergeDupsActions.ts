import { Action, PayloadAction } from "@reduxjs/toolkit";

import { Word } from "api/models";
import * as backend from "backend";
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
  resetTreeToInitialAction,
  setDataAction,
  setSidebarAction,
  setVernacularAction,
  toggleOverrideProtectionAction,
} from "goals/MergeDuplicates/Redux/MergeDupsReducer";
import {
  CombineSenseMergePayload,
  FlagWordPayload,
  MergeTreeState,
  MoveSensePayload,
  OrderSensePayload,
  SetVernacularPayload,
} from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import {
  addCompletedMergeToGoal,
  asyncUpdateGoal,
} from "goals/Redux/GoalActions";
import { type StoreState, type StoreStateDispatch } from "rootRedux/types";

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

export function resetTreeToInitial(): Action {
  return resetTreeToInitialAction();
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

export function toggleOverrideProtection(): Action {
  return toggleOverrideProtectionAction();
}

// Dispatch Functions

export function deferMerge() {
  return async (_: StoreStateDispatch, getState: () => StoreState) => {
    const mergeTree = getState().mergeDuplicateGoal;
    await backend.graylistAdd(Object.keys(mergeTree.data.words));
  };
}

/** Dispatch function to construct all merges from the current merge tree.
 * Each word with all senses deleted results in a `MergeWord` with `deleteOnly: true`.
 * Each word column with no changes is ignored.
 * Each word column with any changes results in a `MergeWord` with `deleteOnly: false`.
 * The resulting `MergeWord` array is sent to the backend for merging.
 * Also, the merges are added as changes to the current goal.
 * Also, the new set of ids (for merge parents and unchanged words) is blacklisted. */
export function mergeAll() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    // Get MergeWord array from the state.
    dispatch(getMergeWords());
    const mergeTree = getState().mergeDuplicateGoal;
    const mergeWordsArray = [...mergeTree.mergeWords];
    dispatch(clearMergeWords());

    let parentIds: string[] = [];
    if (mergeWordsArray.length) {
      // Send merges to the backend.
      parentIds = await backend.mergeWords(mergeWordsArray);

      // Add merges as changes to the goal.
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
    const mergedIds = new Set(
      mergeWordsArray.flatMap((mw) => mw.children.map((c) => c.srcWordId))
    );
    const unmergedIds = Object.keys(mergeTree.data.words).filter(
      (id) => !mergedIds.has(id)
    );
    const blacklistIds = [...unmergedIds, ...parentIds];
    if (blacklistIds.length > 1) {
      await backend.blacklistAdd(blacklistIds);
    }
  };
}

// Helper function to check if the current state has changed from initial
export function hasStateChanged(state: MergeTreeState): boolean {
  if (!state.initialState) {
    return false;
  }

  // Compare current tree and audio.moves with initial state
  const currentStateJson = JSON.stringify({
    tree: state.tree,
    audioMoves: state.audio.moves,
  });
  const initialStateJson = JSON.stringify({
    tree: state.initialState.tree,
    audioMoves: {},
  });

  return currentStateJson !== initialStateJson;
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
