import { StoreState } from "../../../types";
import { ThunkDispatch } from "redux-thunk";
import { MergeTreeReference, Hash, TreeDataSense } from "./MergeDupsTree";
import { Word, State } from "../../../types/word";
import * as backend from "../../../backend";
import {
  getUserEditId,
  getIndexInHistory,
  getUser,
  updateGoal,
  UpdateGoalAction,
  updateStepData
} from "../../../components/GoalTimeline/GoalsActions";
import { Goal, GoalHistoryState } from "../../../types/goals";
import { Dispatch } from "redux";
import { MergeDups } from "../MergeDups";
import navigationHistory from "../../../history";
import { User } from "../../../types/user";

export enum MergeTreeActions {
  SET_VERNACULAR = "SET_VERNACULAR",
  SET_PLURAL = "SET_PLURAL",
  MOVE_SENSE = "MOVE_SENSE",
  ORDER_SENSE = "ORDER_SENSE",
  SET_SENSE = "SET_SENSE",
  SET_DATA = "SET_DATA",
  CLEAR_TREE = "CLEAR_TREE",
  ORDER_DUPLICATE = "ORDER_DUPLICATE"
}

interface MergeDataAction {
  type: MergeTreeActions.SET_DATA;
  payload: Word[];
}

interface MergeTreeMoveAction {
  type: MergeTreeActions.MOVE_SENSE;
  payload: { src: MergeTreeReference[]; dest: MergeTreeReference[] };
}

interface MergeTreeSetAction {
  type: MergeTreeActions.SET_SENSE;
  payload: { ref: MergeTreeReference; data: number | undefined };
}

interface MergeOrderAction {
  type: MergeTreeActions.ORDER_SENSE;
  wordID: string;
  senseID: string;
  order: number;
}

interface MergeTreeWordAction {
  type: MergeTreeActions.SET_VERNACULAR | MergeTreeActions.SET_PLURAL;
  payload: { wordID: string; data: string };
}

export type MergeTreeAction =
  | MergeTreeWordAction
  | MergeTreeMoveAction
  | MergeTreeSetAction
  | MergeDataAction
  | MergeOrderAction
  | {
      type: MergeTreeActions.ORDER_DUPLICATE;
      ref: MergeTreeReference;
      order: number;
    }
  | { type: MergeTreeActions.CLEAR_TREE };

// action creators
export function setVern(wordID: string, vern: string): MergeTreeAction {
  return {
    type: MergeTreeActions.SET_VERNACULAR,
    payload: { wordID, data: vern }
  };
}

export function setPlural(wordID: string, plural: string): MergeTreeAction {
  return {
    type: MergeTreeActions.SET_PLURAL,
    payload: { wordID, data: plural }
  };
}

export function clearTree(): MergeTreeAction {
  return { type: MergeTreeActions.CLEAR_TREE };
}

export function moveSenses(
  src: MergeTreeReference[],
  dest: MergeTreeReference[]
): MergeTreeAction {
  return {
    type: MergeTreeActions.MOVE_SENSE,
    payload: { src, dest }
  };
}

// sugar for moving a single sense
export function moveSense(
  src: MergeTreeReference,
  dest: MergeTreeReference
): MergeTreeAction {
  return moveSenses([src], [dest]);
}

export function setSense(
  ref: MergeTreeReference,
  data: number | undefined
): MergeTreeAction {
  return {
    type: MergeTreeActions.SET_SENSE,
    payload: { ref, data }
  };
}

export function removeSense(ref: MergeTreeReference): MergeTreeAction {
  return setSense(ref, undefined);
}

export function setWordData(words: Word[]): MergeDataAction {
  return {
    type: MergeTreeActions.SET_DATA,
    payload: words
  };
}

export function orderSense(
  wordID: string,
  senseID: string,
  order: number
): MergeOrderAction {
  return {
    type: MergeTreeActions.ORDER_SENSE,
    wordID: wordID,
    senseID: senseID,
    order: order
  };
}

export function orderDuplicate(
  ref: MergeTreeReference,
  order: number
): MergeTreeAction {
  return {
    type: MergeTreeActions.ORDER_DUPLICATE,
    ref,
    order
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

async function addStepToGoal(goal: Goal, indexInHistory: number) {
  let user: User | undefined = getUser();
  if (user !== undefined) {
    let userEditId: string | undefined = getUserEditId(user);
    if (userEditId !== undefined) {
      await backend.addStepToGoal(userEditId, indexInHistory, goal);
    }
  }
}

export function refreshWords() {
  return async (
    dispatch: ThunkDispatch<any, any, MergeTreeAction>,
    getState: () => StoreState
  ) => {
    let historyState: GoalHistoryState = getState().goalsState.historyState;
    let goal: Goal = historyState.history[historyState.history.length - 1];

    await goToNextStep(dispatch, goal, historyState).then(() => {
      historyState = getState().goalsState.historyState;
      goal = historyState.history[historyState.history.length - 1];
      if (goal.currentStep <= goal.numSteps) {
        let words: Word[] = (goal as MergeDups).steps[goal.currentStep - 1]
          .words;
        dispatch(setWordData(words));
      } else {
        navigationHistory.push("/goals");
      }
    });
  };
}

function goToNextStep(
  dispatch: Dispatch<UpdateGoalAction>,
  goal: Goal,
  state: GoalHistoryState
): Promise<void> {
  return new Promise((resolve, reject) => {
    let updatedGoal = updateStepData(goal);
    dispatch(updateGoal(updatedGoal));
    let indexInHistory: number = getIndexInHistory(state.history, goal);
    addStepToGoal(state.history[indexInHistory], indexInHistory);
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
  const word = getState().mergeDuplicateGoal.mergeTreeState.tree.words[wordID];
  if (word) {
    const data = getState().mergeDuplicateGoal.mergeTreeState.data;

    // create a list of all senses and add merge type tags slit by src word
    let senses: Hash<SenseWithState[]> = {};

    let allSenses = Object.values(word.senses).map(sense =>
      Object.values(sense)
    );

    // build senses array
    for (let senseList of allSenses) {
      for (let sense of senseList) {
        let senseData = data.senses[sense];
        let wordID = senseData.srcWord;
        let senseIndex = senseData.order;

        let map = mapping[`${wordID}:${senseData.order}`];
        if (map) {
          wordID = map.srcWord;
          senseIndex = map.order;
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
              state: State.separate
            });
          }
        }
      }
    }

    // Set sense and duplicate senses
    Object.values(word.senses).forEach(sense => {
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
      senses[wordID][senseIndex].state = State.sense;

      // we want a list of all senses skipping the first
      let dups = senseIDs
        .slice(1)
        .map(id => ({ ...data.senses[id], state: State.duplicate }));

      // set each dup to be merged as duplicates
      dups.forEach(dup => {
        senses[dup.srcWord][dup.order].state = State.duplicate;
      });
    });

    // clean order of senses in each src word to reflect
    // the order in the backend
    Object.values(senses).forEach(wordSenses => {
      wordSenses = wordSenses.sort((a, b) => a.order - b.order);
      senses[wordSenses[0].srcWord] = wordSenses;
    });

    // construct parent word
    let parent: Word = { ...data.words[wordID], senses: [] };
    // construct sense children
    let children = Object.values(senses).map(word => {
      word.forEach(sense => {
        if (sense.state === State.sense || sense.state === State.active) {
          parent.senses.push({
            glosses: sense.glosses,
            semanticDomains: sense.semanticDomains
          });
        }
      });
      return {
        wordID: word[0].srcWord,
        senses: word.map(sense => sense.state)
      };
    });

    // send database call
    let newWords = await backend.mergeWords(parent, children);
    let separateIndex = 0;
    let keepCounts: number[] = [];
    for (let i in newWords) {
      keepCounts[i] = 0;
    }

    for (let wordIndex in children) {
      let word = await backend.getWord(children[wordIndex].wordID);
      // get original wordID
      let origWord = children[wordIndex];

      // if merge contains separate increment index
      if (origWord.senses.includes(State.separate)) {
        separateIndex++;
      }

      for (let senseIndex in origWord.senses) {
        let src = `${origWord.wordID}:${senseIndex}`;
        switch (origWord.senses[senseIndex]) {
          case State.sense:
            mapping[src] = { srcWord: newWords[0], order: keepCounts[0] };
            keepCounts[0]++;
            break;
          case State.separate:
            mapping[src] = {
              srcWord: newWords[separateIndex],
              order: keepCounts[separateIndex]
            };
            keepCounts[separateIndex]++;
            break;
          case State.duplicate:
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
    let mapping: Hash<{ srcWord: string; order: number }> = {};
    for (let wordID of Object.keys(
      getState().mergeDuplicateGoal.mergeTreeState.tree.words
    )) {
      mapping = await mergeWord(wordID, getState, mapping);
    }
  };
}
