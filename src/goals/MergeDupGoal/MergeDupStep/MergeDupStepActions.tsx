import * as backend from "backend";
import * as LocalStorage from "backend/localStorage";
import DupFinder from "goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import { MergeDups, MergeStepData } from "goals/MergeDupGoal/MergeDups";
import {
  Hash,
  MergeTreeReference,
  TreeDataSense,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";
import { maxNumSteps } from "types/goalUtilities";
import { MergeSourceWord, MergeWords, State, Word } from "types/word";

export enum MergeTreeActions {
  CLEAR_TREE = "CLEAR_TREE",
  MOVE_SENSE = "MOVE_SENSE",
  ORDER_DUPLICATE = "ORDER_DUPLICATE",
  ORDER_SENSE = "ORDER_SENSE",
  SET_DATA = "SET_DATA",
  SET_PLURAL = "SET_PLURAL",
  SET_SENSE = "SET_SENSE",
  SET_VERNACULAR = "SET_VERNACULAR",
}

interface ClearTreeMergeAction {
  type: MergeTreeActions.CLEAR_TREE;
}

interface MoveSenseMergeAction {
  type: MergeTreeActions.MOVE_SENSE;
  payload: { src: MergeTreeReference[]; dest: MergeTreeReference[] };
}

interface OrderDuplicateMergeAction {
  type: MergeTreeActions.ORDER_DUPLICATE;
  payload: { ref: MergeTreeReference; order: number };
}

interface OrderSenseMergeAction {
  type: MergeTreeActions.ORDER_SENSE;
  payload: {
    wordId: string;
    senseId: string;
    order: number;
  };
}

interface SetDataMergeAction {
  type: MergeTreeActions.SET_DATA;
  payload: Word[];
}

interface SetSenseMergeAction {
  type: MergeTreeActions.SET_SENSE;
  payload: { ref: MergeTreeReference; data: number | undefined };
}

interface SetWordStringMergeAction {
  type: MergeTreeActions.SET_PLURAL | MergeTreeActions.SET_VERNACULAR;
  payload: { wordId: string; data: string };
}

export type MergeTreeAction =
  | ClearTreeMergeAction
  | MoveSenseMergeAction
  | OrderDuplicateMergeAction
  | OrderSenseMergeAction
  | SetDataMergeAction
  | SetSenseMergeAction
  | SetWordStringMergeAction;

// Action Creators

export function setVern(
  wordId: string,
  vern: string
): SetWordStringMergeAction {
  return {
    type: MergeTreeActions.SET_VERNACULAR,
    payload: { wordId, data: vern },
  };
}

export function clearTree(): ClearTreeMergeAction {
  return { type: MergeTreeActions.CLEAR_TREE };
}

export function moveSenses(
  src: MergeTreeReference[],
  dest: MergeTreeReference[]
): MoveSenseMergeAction {
  return {
    type: MergeTreeActions.MOVE_SENSE,
    payload: { src, dest },
  };
}

export function moveSense(
  src: MergeTreeReference,
  dest: MergeTreeReference
): MoveSenseMergeAction {
  return moveSenses([src], [dest]);
}

export function setSense(
  ref: MergeTreeReference,
  data: number | undefined
): SetSenseMergeAction {
  return {
    type: MergeTreeActions.SET_SENSE,
    payload: { ref, data },
  };
}

export function removeSense(ref: MergeTreeReference): SetSenseMergeAction {
  return setSense(ref, undefined);
}

export function setWordData(words: Word[]): SetDataMergeAction {
  return {
    type: MergeTreeActions.SET_DATA,
    payload: words,
  };
}

export function orderSense(
  wordId: string,
  senseId: string,
  order: number
): OrderSenseMergeAction {
  return {
    type: MergeTreeActions.ORDER_SENSE,
    payload: { wordId, senseId, order },
  };
}

export function orderDuplicate(
  ref: MergeTreeReference,
  order: number
): OrderDuplicateMergeAction {
  return {
    type: MergeTreeActions.ORDER_DUPLICATE,
    payload: { ref, order },
  };
}

// Dispatch Functions

export function mergeSense() {
  return async (_dispatch: StoreStateDispatch, _getState: () => StoreState) => {
    // TODO: Merge all duplicates into sense and remove them from tree leaving new word on top
  };
}

type SenseWithState = TreeDataSense & { state: State };

function getMergeWords(
  wordId: string,
  getState: () => StoreState
): MergeWords | undefined {
  // Find and build MergeSourceWord[].
  const word = getState().mergeDuplicateGoal.tree.words[wordId];
  if (word) {
    const data = getState().mergeDuplicateGoal.data;

    // Create list of all senses and add merge type tags slit by src word.
    const senses: Hash<SenseWithState[]> = {};

    const allSenses = Object.values(word.senses).map((sense) =>
      Object.values(sense)
    );

    // Build senses array.
    for (const senseList of allSenses) {
      for (const sense of senseList) {
        const senseData = data.senses[sense];
        const wordId = senseData.srcWordId;

        if (!senses[wordId]) {
          const dbWord = data.words[wordId];

          // Add each sense into senses as separate.
          senses[wordId] = [];
          for (const sense of dbWord.senses) {
            senses[wordId].push({
              ...sense,
              srcWordId: wordId,
              order: senses[wordId].length,
              state: State.Separate,
            });
          }
        }
      }
    }

    // Set sense and duplicate senses.
    Object.values(word.senses).forEach((senseHash) => {
      const senseIds = Object.values(senseHash);

      // Set the first sense to be merged as sense.
      const senseData = data.senses[senseIds[0]];
      const wordId = senseData.srcWordId;
      const senseIndex = senseData.order;
      const mainSense = senses[wordId][senseIndex];
      mainSense.state = State.Sense;

      // Merge the rest as duplicates.
      const dups = senseIds.slice(1).map((id) => data.senses[id]);
      dups.forEach((dup) => {
        const dupSense = senses[dup.srcWordId][dup.order];
        dupSense.state = State.Duplicate;
        // Put this sense's domains in the main sense's.
        for (const dom of dupSense.semanticDomains) {
          if (!mainSense.semanticDomains.find((d) => d.id === dom.id)) {
            mainSense.semanticDomains.push(dom);
          }
        }
      });
    });

    // clean order of senses in each src word to reflect
    // the order in the backend
    const childSources = Object.values(senses);
    childSources.forEach((wordSenses) => {
      wordSenses = wordSenses.sort((a, b) => a.order - b.order);
      senses[wordSenses[0].srcWordId] = wordSenses;
    });

    // a merge is an identity if the only child is the parent word
    // and it has the same number of senses as parent (all with State.Sense)
    if (
      childSources.length === 1 &&
      childSources[0][0].srcWordId === wordId &&
      childSources[0].length === data.words[wordId].senses.length &&
      !childSources[0].find((s) => s.state !== State.Sense)
    ) {
      // if the merge is an identity don't bother sending a merge
      return undefined;
    }

    // construct parent word
    const parent: Word = { ...data.words[wordId], senses: [] };

    // construct sense children
    const children: MergeSourceWord[] = childSources.map((wordSenses) => {
      wordSenses.forEach((sense) => {
        if (sense.state === State.Sense || sense.state === State.Active) {
          parent.senses.push({
            guid: sense.guid,
            glosses: sense.glosses,
            semanticDomains: sense.semanticDomains,
          });
        }
      });
      return {
        srcWordId: wordSenses[0].srcWordId,
        getAudio: !wordSenses.find((s) => s.state === State.Separate),
      };
    });

    return { parent, children };
  }
}

export function mergeAll() {
  return async (_dispatch: StoreStateDispatch, getState: () => StoreState) => {
    // Generate blacklist.
    const wordIds = Object.keys(getState().mergeDuplicateGoal.data.words);
    const blacklist = LocalStorage.getMergeDupsBlacklist();
    blacklistSetAndAllSubsets(blacklist, wordIds);
    LocalStorage.setMergeDupsBlacklist(blacklist);

    // Merge words.
    const words = Object.keys(getState().mergeDuplicateGoal.tree.words);
    const mergeWordsArray: MergeWords[] = [];
    words.forEach((id) => {
      const wordsToMerge = getMergeWords(id, getState);
      if (wordsToMerge) {
        mergeWordsArray.push(wordsToMerge);
      }
    });
    if (mergeWordsArray.length) {
      await backend.mergeWords(mergeWordsArray);
    }
  };
}

// Blacklist Functions

function generateBlacklistHash(wordIds: string[]) {
  return wordIds.sort().reduce((val, acc) => `${acc}:${val}`, "");
}

// Recursively blacklist all subsets of length at least 2.
function blacklistSetAndAllSubsets(
  blacklist: Hash<boolean>,
  wordIds: string[]
) {
  let hash = generateBlacklistHash(wordIds);
  blacklist[hash] = true;
  if (wordIds.length > 2) {
    wordIds.forEach((id) => {
      const subset = wordIds.filter((i) => i !== id);
      hash = generateBlacklistHash(subset);
      if (!blacklist[hash]) {
        blacklistSetAndAllSubsets(blacklist, subset);
      }
    });
  }
}

// Used in MergeDups cases of GoalActions functions

export function dispatchMergeStepData(goal: MergeDups) {
  return (dispatch: StoreStateDispatch) => {
    const stepData = goal.steps[goal.currentStep] as MergeStepData;
    if (stepData) {
      const stepWords = stepData.words ?? [];
      dispatch(setWordData(stepWords));
    }
  };
}

export async function loadMergeDupsData(goal: MergeDups) {
  const finder = new DupFinder();
  const groups = await finder.getNextDups();

  const usedIDs: string[] = [];
  const newGroups = [];
  const blacklist = LocalStorage.getMergeDupsBlacklist();

  for (const group of groups) {
    // Remove words that are already included.
    const newGroup = group.filter((w) => !usedIDs.includes(w.id));
    if (newGroup.length < 2) {
      continue;
    }

    // Add if not blacklisted.
    const groupIds = newGroup.map((w) => w.id);
    const groupHash = generateBlacklistHash(groupIds);
    if (!blacklist[groupHash]) {
      newGroups.push(newGroup);
      usedIDs.push(...groupIds);
    }

    // Stop the process once maxNumSteps many groups found.
    if (newGroups.length === maxNumSteps(goal.goalType)) {
      break;
    }
  }

  // Add data to goal.
  goal.data = { plannedWords: newGroups };
  goal.numSteps = newGroups.length;

  // Reset goal steps.
  goal.currentStep = 0;
  goal.steps = [];

  return goal;
}
