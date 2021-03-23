import * as backend from "backend";
import * as LocalStorage from "backend/localStorage";
import { updateGoal } from "components/GoalTimeline/GoalsActions";
import DupFinder from "goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import {
  CompletedMerge,
  MergeDups,
  MergesCompleted,
  MergeStepData,
} from "goals/MergeDupGoal/MergeDups";
import { MergeTreeState } from "goals/MergeDupGoal/MergeDupStep/MergeDupStepReducer";
import {
  Hash,
  MergeTreeReference,
  TreeDataSense,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";
import { GoalType } from "types/goals";
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

// Given a wordId, constructs from the state the corresponing MergeWords.
// Returns the MergeWords, or undefined if the parent and child are identical.
function getMergeWords(
  wordId: string,
  mergeTree: MergeTreeState
): MergeWords | undefined {
  // Find and build MergeSourceWord[].
  const word = mergeTree.tree.words[wordId];
  if (word) {
    const data = mergeTree.data;

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

      // Set the first sense to be merged as State.Sense.
      const senseData = data.senses[senseIds[0]];
      const mainSense = senses[senseData.srcWordId][senseData.order];
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

    // Clean order of senses in each src word to reflect backend order.
    Object.values(senses).forEach((wordSenses) => {
      wordSenses = wordSenses.sort((a, b) => a.order - b.order);
      senses[wordSenses[0].srcWordId] = wordSenses;
    });

    // Don't return empty merges: when the only child is the parent word
    // and has the same number of senses as parent (all with State.Sense).
    if (Object.values(senses).length === 1) {
      const onlyChild = Object.values(senses)[0];
      if (
        onlyChild[0].srcWordId === wordId &&
        onlyChild.length === data.words[wordId].senses.length &&
        !onlyChild.find((s) => s.state !== State.Sense)
      ) {
        return undefined;
      }
    }

    // Construct parent and children.
    const parent: Word = { ...data.words[wordId], senses: [] };
    const children: MergeSourceWord[] = Object.values(senses).map((sList) => {
      sList.forEach((sense) => {
        if (sense.state === State.Sense || sense.state === State.Active) {
          parent.senses.push({
            guid: sense.guid,
            glosses: sense.glosses,
            semanticDomains: sense.semanticDomains,
          });
        }
      });
      return {
        srcWordId: sList[0].srcWordId,
        getAudio: !sList.find((sense) => sense.state === State.Separate),
      };
    });

    return { parent, children };
  }
}

export function mergeAll() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    // Generate blacklist.
    const mergeTree = getState().mergeDuplicateGoal;
    const wordIds = Object.keys(mergeTree.data.words);
    const blacklist = LocalStorage.getMergeDupsBlacklist();
    blacklistSetAndAllSubsets(blacklist, wordIds);
    LocalStorage.setMergeDupsBlacklist(blacklist);

    // Merge words.
    const words = Object.keys(mergeTree.tree.words);
    const mergeWordsArray: MergeWords[] = [];
    words.forEach((id) => {
      const wordsToMerge = getMergeWords(id, mergeTree);
      if (wordsToMerge) {
        mergeWordsArray.push(wordsToMerge);
      }
    });
    if (mergeWordsArray.length) {
      const parentIds = await backend.mergeWords(mergeWordsArray);
      const childrenIds = [
        ...new Set(
          mergeWordsArray.flatMap((m) => m.children).map((s) => s.srcWordId)
        ),
      ];
      const completedMerge = { childrenIds, parentIds };
      const goal = getState().goalsState.currentGoal;
      if (goal) {
        dispatch(addCompletedMergeToGoal(goal, completedMerge));
      }
    }
  };
}

function addCompletedMergeToGoal(
  goal: MergeDups,
  completedMerge: CompletedMerge
) {
  return (dispatch: StoreStateDispatch) => {
    if (goal.goalType === GoalType.MergeDups) {
      const changes = goal.changes as MergesCompleted;
      if (!changes.merges) {
        changes.merges = [];
      }
      changes.merges.push(completedMerge);
      goal.changes = changes;
      dispatch(updateGoal(goal));
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
