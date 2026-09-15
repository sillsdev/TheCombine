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

/** Run a step that follows a committed merge. Retrying the save cannot undo that merge, so
 * report the failure instead of letting it reject, and let the remaining steps run. */
async function reportFailure(step: () => Promise<void>): Promise<void> {
  try {
    await step();
  } catch (err) {
    // The api layer already reported the error; add the context it cannot have.
    console.error("Merge saved; a follow-up step failed:", err);
  }
}

/** Dispatch function to construct all merges from the current merge tree.
 *
 * Each word with all senses deleted results in a `MergeWord` with `deleteOnly: true`.
 * Each word column with no changes is ignored.
 * Each word column with any changes results in a `MergeWord` with `deleteOnly: false`.
 * The resulting `MergeWord` array is sent to the backend for merging.
 * Also, the merges are added as changes to the current goal.
 * Also, the new set of ids (for merge parents and unchanged words) is blacklisted.
 *
 * Only retryable failures reject: the merge request, or the blacklisting of a set with no
 * merges. Once a merge is committed its children are gone from the Frontier, so the steps
 * after it report their failures independently rather than failing the save. */
export function mergeAll() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    // Get MergeWord array from the state.
    dispatch(getMergeWords());
    const mergeTree = getState().mergeDuplicateGoal;
    const mergeWordsArray = [...mergeTree.mergeWords];
    dispatch(clearMergeWords());

    /** Blacklist the set of words with updated ids. */
    const blacklistSet = async (parentIds: string[]): Promise<void> => {
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

    // With nothing to merge, blacklisting is the only record of the decision not to merge
    // this set, and no merge has been committed, so let a failure reject for a retry.
    if (!mergeWordsArray.length) {
      await blacklistSet([]);
      return;
    }

    // Send merges to the backend. This is the only step the caller can safely retry.
    const parentIds = await backend.mergeWords(mergeWordsArray);

    // The merge is committed. What follows is independent bookkeeping, so a failure in one
    // step must neither fail the save nor skip the other step.
    await reportFailure(async () => {
      // Add merges as changes to the goal.
      const childIds = [
        ...new Set(
          mergeWordsArray.flatMap((m) => m.children).map((s) => s.srcWordId)
        ),
      ];
      const completedMerge = { childIds, parentIds };
      dispatch(addCompletedMergeToGoal(completedMerge));
      await dispatch(asyncUpdateGoal());
    });
    await reportFailure(() => blacklistSet(parentIds));
  };
}

/** Helper function to check if the current state has changed from initial */
export function hasStateChanged(state: MergeTreeState): boolean {
  if (!state.initialTree) {
    return false;
  }

  // Check if audio.moves has any entries
  if (Object.keys(state.audio.moves).length > 0) {
    return true;
  }

  // Compare current tree with initial state
  return JSON.stringify(state.tree) !== state.initialTree;
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
