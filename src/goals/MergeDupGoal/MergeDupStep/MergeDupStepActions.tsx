import { StoreState } from "../../../types";
import { ThunkDispatch } from "redux-thunk";
import { MergeTreeReference, Hash, TreeDataSense } from "./MergeDupsTree";
import { Word, State } from "../../../types/word";
import * as backend from "../../../backend";
import {
  nextStep,
  NextStep,
  getUserEditId,
  getIndexInHistory
} from "../../../components/GoalTimeline/GoalsActions";
import { Goal } from "../../../types/goals";
import { Dispatch } from "redux";
import { MergeDups } from "../MergeDups";
import { UserProjectMap } from "../../../components/Project/UserProject";

export enum MergeTreeActions {
  SET_VERNACULAR = "SET_VERNACULAR",
  SET_PLURAL = "SET_PLURAL",
  MOVE_SENSE = "MOVE_SENSE",
  ORDER_SENSE = "ORDER_SENSE",
  SET_SENSE = "SET_SENSE",
  SET_DATA = "SET_DATA",
  CLEAR_TREE = "CLEAR_TREE"
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
  payload: { wordID: number; data: string };
}

export type MergeTreeAction =
  | MergeTreeWordAction
  | MergeTreeMoveAction
  | MergeTreeSetAction
  | MergeDataAction
  | MergeOrderAction
  | { type: MergeTreeActions.CLEAR_TREE };

// action creators
export function setVern(wordID: number, vern: string): MergeTreeAction {
  return {
    type: MergeTreeActions.SET_VERNACULAR,
    payload: { wordID, data: vern }
  };
}

export function setPlural(wordID: number, plural: string): MergeTreeAction {
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

export function mergeSense() {
  return async (
    _dispatch: ThunkDispatch<any, any, MergeTreeAction>,
    _getState: () => StoreState
  ) => {
    // TODO: Merge all duplicates into sense and remove them from tree leaving new word on top
  };
}

const goToNextStep = (
  dispatch: Dispatch<NextStep>,
  history: Goal[],
  goal: Goal
) =>
  new Promise((resolve, reject) => {
    dispatch(nextStep());
    let indexInHistory: number = getIndexInHistory(history, goal);
    addStepToGoal(goal, indexInHistory);
    resolve();
  });

async function addStepToGoal(goal: Goal, indexInHistory: number) {
  let projectId: string = backend.getProjectId();
  let userEditId: string = getUserEditId();
  let userProjectMap: UserProjectMap = {
    projectId: projectId,
    userEditId: userEditId
  };
  await backend.addStepToGoal(userProjectMap, indexInHistory, goal);
}

export function refreshWords() {
  return async (
    dispatch: ThunkDispatch<any, any, MergeTreeAction | NextStep>,
    getState: () => StoreState
  ) => {
    let history: Goal[] = getState().goalsState.historyState.history;
    let goal: Goal = history[history.length - 1];
    goToNextStep(dispatch, history, goal).then(() => {
      let words: Word[] = (goal as MergeDups).steps[goal.currentStep - 1].words;
      dispatch(setWordData(words));
    });
  };
}

type SenseWithState = TreeDataSense & { state: State };

export function mergeWord(wordID: string) {
  return async (
    dispatch: ThunkDispatch<any, any, MergeTreeAction>,
    getState: () => StoreState
  ) => {
    // find and build MergeWord[]
    const word = getState().mergeDuplicateGoal.mergeTreeState.tree.words[
      wordID
    ];
    if (word) {
      const data = getState().mergeDuplicateGoal.mergeTreeState.data;

      // create a list of all senses and add merge type tags slit by src word
      let senses: Hash<SenseWithState[]> = {};

      Object.values(word.senses).forEach(sense => {
        let senseIDs = Object.values(sense);
        let senseData = data.senses[senseIDs[0]];
        if (senses[senseData.srcWord]) {
          senses[senseData.srcWord].push({ ...senseData, state: State.sense });
        } else {
          senses[senseData.srcWord] = [{ ...senseData, state: State.sense }];
        }
        delete senseIDs[0];
        let dups = senseIDs.map(id => {
          return { ...data.senses[id], state: State.duplicate };
        });
        dups.forEach(dup => {
          if (senses[dup.srcWord]) {
            senses[dup.srcWord].push(dup);
          } else {
            senses[dup.srcWord] = [dup];
          }
        });
      });

      // clean order of senses in each src word to reflect
      // the order in the backend
      Object.values(senses).forEach(wordSenses => {
        wordSenses = wordSenses.sort((a, b) => a.order - b.order);
        senses[wordSenses[0].srcWord] = wordSenses;
      });

      // construct parent word
      let parent = data.words[wordID];
      parent.senses = [];

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
      await backend.mergeWords(parent, children);
    }
  };
}

export function mergeAll() {
  return async (
    dispatch: ThunkDispatch<any, any, MergeTreeAction>,
    getState: () => StoreState
  ) => {
    for (let wordID of Object.keys(
      getState().mergeDuplicateGoal.mergeTreeState.data.words
    )) {
      await dispatch(mergeWord(wordID));
    }
    //await dispatch(clearTree());
    await dispatch(refreshWords());
  };
}
