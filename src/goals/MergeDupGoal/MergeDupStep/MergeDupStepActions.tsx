import { Dispatch } from "redux";
import { ThunkDispatch } from "redux-thunk";

import * as backend from "../../../backend";
import * as LocalStorage from "../../../backend/localStorage";
import {
  getIndexInHistory,
  getUserEditId,
  updateGoal,
  UpdateGoalAction,
  updateStepData,
} from "../../../components/GoalTimeline/GoalsActions";
import history, { Path } from "../../../history";
import { StoreState } from "../../../types";
import { Goal, GoalHistoryState } from "../../../types/goals";
import { State, Word } from "../../../types/word";
import { MergeDups, MergeStepData } from "../MergeDups";
import { Hash, MergeTreeReference, TreeDataSense } from "./MergeDupsTree";

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
    wordID: string;
    senseID: string;
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
  payload: { wordID: string; data: string };
}

export type MergeTreeAction =
  | ClearTreeMergeAction
  | MoveSenseMergeAction
  | OrderDuplicateMergeAction
  | OrderSenseMergeAction
  | SetDataMergeAction
  | SetSenseMergeAction
  | SetWordStringMergeAction;

// action creators
export function setVern(
  wordID: string,
  vern: string
): SetWordStringMergeAction {
  return {
    type: MergeTreeActions.SET_VERNACULAR,
    payload: { wordID, data: vern },
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

// sugar for moving a single sense
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
  wordID: string,
  senseID: string,
  order: number
): OrderSenseMergeAction {
  return {
    type: MergeTreeActions.ORDER_SENSE,
    payload: { wordID, senseID, order },
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

export function mergeSense() {
  return async (
    _dispatch: ThunkDispatch<any, any, MergeTreeAction>,
    _getState: () => StoreState
  ) => {
    // TODO: Merge all duplicates into sense and remove them from tree leaving new word on top
  };
}

async function addStepToGoal(goal: Goal, goalIndex: number) {
  const user = LocalStorage.getCurrentUser();
  if (user) {
    const userEditId: string | undefined = getUserEditId(user);
    if (userEditId !== undefined) {
      await backend.addStepToGoal(userEditId, goalIndex, goal);
    }
  }
}

export function advanceStep() {
  return async (
    dispatch: ThunkDispatch<any, any, MergeTreeAction>,
    getState: () => StoreState
  ) => {
    let historyState: GoalHistoryState = getState().goalsState.historyState;
    let goal: Goal = historyState.history[historyState.history.length - 1];
    goal.currentStep++;
    // Push the current step into the history state and load the data.
    dispatch(refreshWords());
  };
}

export function refreshWords() {
  return async (
    dispatch: ThunkDispatch<any, any, MergeTreeAction>,
    getState: () => StoreState
  ) => {
    let historyState = getState().goalsState.historyState;
    let goal = historyState.history[historyState.history.length - 1];

    // Push the current step into the history state and load the data.
    await updateStep(dispatch, goal, historyState).then(() => {
      historyState = getState().goalsState.historyState;
      goal = historyState.history[historyState.history.length - 1];
      if (goal.currentStep < goal.numSteps) {
        const stepData = (goal as MergeDups).steps[
          goal.currentStep
        ] as MergeStepData;
        if (stepData) {
          dispatch(setWordData(stepData.words));
        }
      } else {
        history.push(Path.Goals);
      }
    });
  };
}

//
function updateStep(
  dispatch: Dispatch<UpdateGoalAction>,
  goal: Goal,
  state: GoalHistoryState
): Promise<void> {
  return new Promise((resolve) => {
    const updatedGoal = updateStepData(goal);
    dispatch(updateGoal(updatedGoal));
    const goalIndex = getIndexInHistory(state.history, goal);
    addStepToGoal(state.history[goalIndex], goalIndex);
    resolve();
  });
}

type SenseWithState = TreeDataSense & { state: State };

export async function mergeWord(
  wordID: string,
  getState: () => StoreState,
  mapping: Hash<{ srcWord: string; order: number }>
): Promise<Hash<{ srcWord: string; order: number }>> {
  // find and build MergeWord[]
  const word = getState().mergeDuplicateGoal.tree.words[wordID];
  if (word) {
    const data = getState().mergeDuplicateGoal.data;

    // create a list of all senses and add merge type tags slit by src word
    let senses: Hash<SenseWithState[]> = {};

    let allSenses = Object.values(word.senses).map((sense) =>
      Object.values(sense)
    );

    // build senses array
    for (let senseList of allSenses) {
      for (let sense of senseList) {
        let senseData = data.senses[sense];
        let wordID = senseData.srcWord;

        let map = mapping[`${wordID}:${senseData.order}`];
        if (map) {
          wordID = map.srcWord;
        }

        if (!senses[wordID]) {
          let dbWord = await backend.getWord(wordID);

          // add each sense into senses as separate
          senses[wordID] = [];
          for (let sense of dbWord.senses) {
            senses[wordID].push({
              ...sense,
              srcWord: wordID,
              order: senses[wordID].length,
              state: State.Separate,
            });
          }
        }
      }
    }

    // Set sense and duplicate senses
    Object.values(word.senses).forEach((sense) => {
      let senseIDs = Object.values(sense);
      let senseData = data.senses[senseIDs[0]];
      let wordID = senseData.srcWord;
      let senseIndex = senseData.order;

      let map = mapping[`${wordID}:${senseData.order}`];
      if (map) {
        wordID = map.srcWord;
        senseIndex = map.order;
      }
      // set this sense to be merged as sense
      senses[wordID][senseIndex].state = State.Sense;

      // we want a list of all senses skipping the first
      let dups = senseIDs
        .slice(1)
        .map((id) => ({ ...data.senses[id], state: State.Duplicate }));

      // set each dup to be merged as duplicates
      dups.forEach((dup) => {
        senses[dup.srcWord][dup.order].state = State.Duplicate;
        // put this sense's semdoms in the parent senses's
        for (let semdom of senses[dup.srcWord][dup.order].semanticDomains) {
          if (
            !senses[wordID][senseIndex].semanticDomains
              .map((a) => a.id)
              .includes(semdom.id)
          ) {
            senses[wordID][senseIndex].semanticDomains.push(semdom);
          }
        }
      });
    });

    // clean order of senses in each src word to reflect
    // the order in the backend
    Object.values(senses).forEach((wordSenses) => {
      wordSenses = wordSenses.sort((a, b) => a.order - b.order);
      senses[wordSenses[0].srcWord] = wordSenses;
    });

    // construct parent word
    let parent: Word = { ...data.words[wordID], senses: [] };

    // construct sense children
    let children = Object.values(senses).map((word) => {
      word.forEach((sense) => {
        if (sense.state === State.Sense || sense.state === State.Active) {
          parent.senses.push({
            glosses: sense.glosses,
            semanticDomains: sense.semanticDomains,
          });
        }
      });
      return {
        wordID: word[0].srcWord,
        senses: word.map((sense) => sense.state),
      };
    });

    // a merge is an identity if the only child is the parent word
    // and it has the same number of senses as parent (all with State.Sense)
    if (
      children.length === 1 &&
      children[0].wordID === wordID &&
      children[0].senses.length === data.words[wordID].senses.length &&
      !children[0].senses.find((s) => s !== State.Sense)
    ) {
      // if the merge is an identity don't bother sending a merge
      return mapping;
    }

    // send database call
    let newWords = await backend.mergeWords(parent, children);
    let separateIndex = 0;
    let keepCounts: number[] = [];
    for (let i in newWords) {
      keepCounts[i] = 0;
    }

    for (let wordIndex in children) {
      // get original wordID
      let origWord = children[wordIndex];

      // if merge contains separate increment index
      if (origWord.senses.includes(State.Separate)) {
        separateIndex++;
      }

      for (let senseIndex in origWord.senses) {
        let src = `${origWord.wordID}:${senseIndex}`;
        switch (origWord.senses[senseIndex]) {
          case State.Sense:
            mapping[src] = { srcWord: newWords[0], order: keepCounts[0] };
            keepCounts[0]++;
            break;
          case State.Separate:
            mapping[src] = {
              srcWord: newWords[separateIndex],
              order: keepCounts[separateIndex],
            };
            keepCounts[separateIndex]++;
            break;
          case State.Duplicate:
            mapping[src] = { srcWord: newWords[0], order: -1 };
            break;
          default:
        }
      }
    }
  }
  return mapping;
}

export function mergeAll() {
  return async (
    dispatch: ThunkDispatch<any, any, MergeTreeAction>,
    getState: () => StoreState
  ) => {
    // Generate blacklist.
    const wordIDs = Object.keys(getState().mergeDuplicateGoal.data.words);
    const blacklist = LocalStorage.getMergeDupsBlacklist();
    blacklistSetAndAllSubsets(blacklist, wordIDs);
    LocalStorage.setMergeDupsBlacklist(blacklist);

    // Merge words.
    let mapping: Hash<{ srcWord: string; order: number }> = {};
    const words = Object.keys(getState().mergeDuplicateGoal.tree.words);
    for (const wordID of words) {
      mapping = await mergeWord(wordID, getState, mapping);
    }
  };
}

export function generateBlacklistHash(wordIDs: string[]) {
  return wordIDs.sort().reduce((val, acc) => `${acc}:${val}`, "");
}

// Recursively blacklist all subsets of length at least 2.
function blacklistSetAndAllSubsets(
  blacklist: Hash<boolean>,
  wordIDs: string[]
) {
  let hash = generateBlacklistHash(wordIDs);
  blacklist[hash] = true;
  if (wordIDs.length > 2) {
    wordIDs.forEach((id) => {
      const subset = wordIDs.filter((i) => i !== id);
      hash = generateBlacklistHash(subset);
      if (!blacklist[hash]) {
        blacklistSetAndAllSubsets(blacklist, subset);
      }
    });
  }
}
