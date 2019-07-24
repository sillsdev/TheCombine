import { Dispatch } from "react";
import { StoreState } from "../../types";
import {
  setCurrentProject,
  ProjectAction
} from "../../components/Project/ProjectActions";
import {
  updateGoal,
  getUserEditId,
  getIndexInHistory,
  GoalAction,
  getUser
} from "../../components/GoalTimeline/GoalsActions";
import { CreateCharInv } from "../CreateCharInv/CreateCharInv";
import * as backend from "../../backend";
import { Goal } from "../../types/goals";
import { Project } from "../../types/project";
import { User } from "../../types/user";

export const SET_VALID_CHARACTERS = "SET_VALID_CHARACTERS";
export type SET_VALID_CHARACTERS = typeof SET_VALID_CHARACTERS;

export const SET_REJECTED_CHARACTERS = "SET_REJECTED_CHARACTERS";
export type SET_REJECTED_CHARACTERS = typeof SET_REJECTED_CHARACTERS;

export const ADD_TO_VALID_CHARACTERS = "ADD_TO_VALID_CHARACTERS";
export type ADD_TO_VALID_CHARACTERS = typeof ADD_TO_VALID_CHARACTERS;

export const SET_ALL_WORDS = "CHARINV_SET_ALL_WORDS";
export type SET_ALL_WORDS = typeof SET_ALL_WORDS;

export interface CharacterInventoryData {}

type CharacterInventoryType =
  | SET_VALID_CHARACTERS
  | SET_REJECTED_CHARACTERS
  | ADD_TO_VALID_CHARACTERS
  | SET_ALL_WORDS;

//action types

export interface CharacterInventoryAction {
  type: CharacterInventoryType;
  payload: string[];
}

/**
 * Sends the character inventory to the server
 */
export function uploadInventory() {
  return async (
    dispatch: Dispatch<CharacterInventoryAction | ProjectAction | GoalAction>,
    getState: () => StoreState
  ) => {
    let state: StoreState = getState();
    let project: Project = updateCurrentProject(state);
    let updatedGoal: Goal = updateCurrentGoal(state);
    let history: Goal[] = state.goalsState.historyState.history;

    await saveChanges(updatedGoal, history, project, dispatch);
  };
}

export function addToValidCharacters(
  chars: string[]
): CharacterInventoryAction {
  return {
    type: ADD_TO_VALID_CHARACTERS,
    payload: chars
  };
}

export function setValidCharacters(chars: string[]): CharacterInventoryAction {
  return {
    type: SET_VALID_CHARACTERS,
    payload: chars
  };
}

export function setRejectedCharacters(
  chars: string[]
): CharacterInventoryAction {
  return {
    type: SET_REJECTED_CHARACTERS,
    payload: chars
  };
}

export function setAllWords(words: string[]): CharacterInventoryAction {
  return {
    type: SET_ALL_WORDS,
    payload: words
  };
}

export function fetchWords() {
  return async (dispatch: Dispatch<CharacterInventoryAction>) => {
    let words = await backend.getAllWords();
    dispatch(setAllWords(words.map(word => word.vernacular)));
  };
}

async function saveChanges(
  goal: Goal,
  history: Goal[],
  project: Project,
  dispatch: Dispatch<CharacterInventoryAction | ProjectAction | GoalAction>
) {
  await saveChangesToGoal(goal, history, dispatch);
  await saveChangesToProject(project, dispatch);
}

async function saveChangesToGoal(
  updatedGoal: Goal,
  history: Goal[],
  dispatch: Dispatch<CharacterInventoryAction | ProjectAction | GoalAction>
) {
  let user: User | undefined = getUser();
  if (user !== undefined) {
    let userEditId: string | undefined = getUserEditId(user);
    if (userEditId !== undefined) {
      let indexInHistory: number = getIndexInHistory(history, updatedGoal);

      dispatch(updateGoal(updatedGoal));
      await backend
        .addStepToGoal(userEditId, indexInHistory, updatedGoal)
        .catch((err: string) => console.log(err));
    }
  }
}

async function saveChangesToProject(
  project: Project,
  dispatch: Dispatch<CharacterInventoryAction | ProjectAction | GoalAction>
) {
  dispatch(setCurrentProject(project));
  await backend.updateProject(project);
}

function updateCurrentProject(state: StoreState): Project {
  let project = state.currentProject;
  project.validCharacters = state.characterInventoryState.validCharacters;
  project.rejectedCharacters = state.characterInventoryState.rejectedCharacters;
  return project;
}

function updateCurrentGoal(state: StoreState): Goal {
  let history: Goal[] = state.goalsState.historyState.history;
  let currentGoal: CreateCharInv = history[history.length - 1] as CreateCharInv;
  // Nothing stored as goal data for now

  return currentGoal;
}
