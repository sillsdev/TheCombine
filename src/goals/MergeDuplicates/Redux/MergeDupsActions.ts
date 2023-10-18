import { Action, PayloadAction } from "@reduxjs/toolkit";

import { MergeSourceWord, MergeWords, Status, Word } from "api/models";
import * as backend from "backend";
import {
  addCompletedMergeToGoal,
  asyncUpdateGoal,
} from "components/GoalTimeline/Redux/GoalActions";
import {
  defaultSidebar,
  MergeTreeReference,
  MergeTreeSense,
  Sidebar,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import {
  MergeDups,
  MergeStepData,
  ReviewDeferredDups,
  newMergeWords,
} from "goals/MergeDuplicates/MergeDupsTypes";
import {
  clearTreeAction,
  combineIntoFirstSenseAction,
  combineSenseAction,
  deleteSenseAction,
  flagWordAction,
  moveDuplicateAction,
  moveSenseAction,
  orderDuplicateAction,
  orderSenseAction,
  setSidebarAction,
  setWordDataAction,
  setVernacularAction,
} from "goals/MergeDuplicates/Redux/MergeDupsReducer";
import {
  CombineSenseMergePayload,
  FlagWordPayload,
  MergeTreeState,
  MoveSensePayload,
  OrderSensePayload,
  SetVernacularPayload,
} from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";
import { Hash } from "types/hash";
import { compareFlags } from "utilities/wordUtilities";

// Action Creation Functions

export function clearTree(): Action {
  return clearTreeAction();
}

export function combineIntoFirstSense(senses: MergeTreeSense[]): PayloadAction {
  return combineIntoFirstSenseAction(senses);
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

export function moveSense(payload: MoveSensePayload): PayloadAction {
  if (payload.ref.order === undefined) {
    return moveSenseAction(payload);
  } else {
    return moveDuplicateAction(payload);
  }
}

export function orderSense(payload: OrderSensePayload): PayloadAction {
  if (payload.ref.order === undefined) {
    return orderSenseAction(payload);
  } else {
    return orderDuplicateAction(payload);
  }
}

export function setSidebar(sidebar?: Sidebar): PayloadAction {
  return setSidebarAction(sidebar ?? defaultSidebar);
}

export function setWordData(words: Word[]): PayloadAction {
  return setWordDataAction(words);
}

export function setVern(payload: SetVernacularPayload): PayloadAction {
  return setVernacularAction(payload);
}

// Dispatch Functions

// Given a wordId, constructs from the state the corresponding MergeWords.
// Returns the MergeWords, or undefined if the parent and child are identical.
function getMergeWords(
  wordId: string,
  mergeTree: MergeTreeState
): MergeWords | undefined {
  // Find and build MergeSourceWord[].
  const word = mergeTree.tree.words[wordId];
  if (word) {
    const data = mergeTree.data;

    // List of all non-deleted senses.
    const nonDeleted = Object.values(mergeTree.tree.words).flatMap((w) =>
      Object.values(w.sensesGuids).flatMap((s) => s)
    );

    // Create list of all senses and add merge type tags slit by src word.
    const senses: Hash<MergeTreeSense[]> = {};

    // Build senses array.
    for (const senseGuids of Object.values(word.sensesGuids)) {
      for (const guid of senseGuids) {
        const senseData = data.senses[guid];
        const wordId = senseData.srcWordId;

        if (!senses[wordId]) {
          const dbWord = data.words[wordId];

          // Add each sense into senses as separate or deleted.
          senses[wordId] = [];
          for (const sense of dbWord.senses) {
            senses[wordId].push({
              ...sense,
              srcWordId: wordId,
              order: senses[wordId].length,
              accessibility: nonDeleted.includes(sense.guid)
                ? Status.Separate
                : Status.Deleted,
              protected: sense.accessibility === Status.Protected,
            });
          }
        }
      }
    }

    // Set sense and duplicate senses.
    Object.values(word.sensesGuids).forEach((guids) => {
      const sensesToCombine = guids
        .map((g) => data.senses[g])
        .map((s) => senses[s.srcWordId][s.order]);
      combineIntoFirstSense(sensesToCombine);
    });

    // Clean order of senses in each src word to reflect backend order.
    Object.values(senses).forEach((wordSenses) => {
      wordSenses = wordSenses.sort((a, b) => a.order - b.order);
      senses[wordSenses[0].srcWordId] = wordSenses;
    });

    // Don't return empty merges: when the only child is the parent word
    // and has the same number of senses as parent (all Active/Protected)
    // and has the same flag.
    if (Object.values(senses).length === 1) {
      const onlyChild = Object.values(senses)[0];
      if (
        onlyChild[0].srcWordId === wordId &&
        onlyChild.length === data.words[wordId].senses.length &&
        !onlyChild.find(
          (s) => ![Status.Active, Status.Protected].includes(s.accessibility)
        ) &&
        compareFlags(word.flag, data.words[wordId].flag) === 0
      ) {
        return undefined;
      }
    }

    // Construct parent and children.
    const parent: Word = { ...data.words[wordId], senses: [], flag: word.flag };
    if (!parent.vernacular) {
      parent.vernacular = word.vern;
    }
    const children: MergeSourceWord[] = Object.values(senses).map((sList) => {
      sList.forEach((sense) => {
        if ([Status.Active, Status.Protected].includes(sense.accessibility)) {
          parent.senses.push({
            guid: sense.guid,
            definitions: sense.definitions,
            glosses: sense.glosses,
            semanticDomains: sense.semanticDomains,
            accessibility: sense.accessibility,
            grammaticalInfo: sense.grammaticalInfo,
          });
        }
      });
      const getAudio = !sList.find((s) => s.accessibility === Status.Separate);
      return { srcWordId: sList[0].srcWordId, getAudio };
    });

    return newMergeWords(parent, children);
  }
}

export function deferMerge() {
  return async (_: StoreStateDispatch, getState: () => StoreState) => {
    const mergeTree = getState().mergeDuplicateGoal;
    await backend.graylistAdd(Object.keys(mergeTree.data.words));
  };
}

export function mergeAll() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const mergeTree = getState().mergeDuplicateGoal;

    // Add to blacklist.
    await backend.blacklistAdd(Object.keys(mergeTree.data.words));

    // Handle words with all senses deleted.
    const possibleWords = Object.values(mergeTree.data.words);
    const nonDeletedSenses = Object.values(mergeTree.tree.words).flatMap((w) =>
      Object.values(w.sensesGuids).flatMap((s) => s)
    );
    const deletedWords = possibleWords.filter(
      (w) =>
        !w.senses.map((s) => s.guid).find((g) => nonDeletedSenses.includes(g))
    );
    const mergeWordsArray = deletedWords.map((w) =>
      newMergeWords(w, [{ srcWordId: w.id, getAudio: false }], true)
    );

    // Merge words.
    const wordIds = Object.keys(mergeTree.tree.words);
    wordIds.forEach((id) => {
      const wordsToMerge = getMergeWords(id, mergeTree);
      if (wordsToMerge) {
        mergeWordsArray.push(wordsToMerge);
      }
    });
    if (mergeWordsArray.length) {
      const parentIds = await backend.mergeWords(mergeWordsArray);
      const childIds = [
        ...new Set(
          mergeWordsArray.flatMap((m) => m.children).map((s) => s.srcWordId)
        ),
      ];
      const completedMerge = { childIds, parentIds };
      if (getState().goalsState.currentGoal) {
        dispatch(addCompletedMergeToGoal(completedMerge));
        await dispatch(asyncUpdateGoal());
      }
    }
  };
}

// Used in MergeDups cases of GoalActions functions

export function dispatchMergeStepData(goal: MergeDups | ReviewDeferredDups) {
  return (dispatch: StoreStateDispatch) => {
    const stepData = goal.steps[goal.currentStep] as MergeStepData;
    if (stepData) {
      const stepWords = stepData.words ?? [];
      dispatch(setWordData(stepWords));
    }
  };
}
