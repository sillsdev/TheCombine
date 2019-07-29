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
import { listChar, characterStatus } from "./CharacterInventoryReducer";

export const SET_CHARACTER_STATUS = "SET_CHARACTER_STATUS";
export type SET_CHARACTER_STATUS = typeof SET_CHARACTER_STATUS;

export const SET_VALID_CHARACTERS = "SET_VALID_CHARACTERS";
export type SET_VALID_CHARACTERS = typeof SET_VALID_CHARACTERS;

export const SET_REJECTED_CHARACTERS = "SET_REJECTED_CHARACTERS";
export type SET_REJECTED_CHARACTERS = typeof SET_REJECTED_CHARACTERS;

export const ADD_TO_VALID_CHARACTERS = "ADD_TO_VALID_CHARACTERS";
export type ADD_TO_VALID_CHARACTERS = typeof ADD_TO_VALID_CHARACTERS;

export const ADD_TO_REJECTED_CHARACTERS = "ADD_TO_REJECTED_CHARACTERS";
export type ADD_TO_REJECTED_CHARACTERS = typeof ADD_TO_REJECTED_CHARACTERS;

export const SET_ALL_WORDS = "CHARINV_SET_ALL_WORDS";
export type SET_ALL_WORDS = typeof SET_ALL_WORDS;

export const SET_SELECTED_CHARACTER = "SET_SELECTED_CHARACTER";
export type SET_SELECTED_CHARACTER = typeof SET_SELECTED_CHARACTER;

export const SET_CHARACTER_SET = "SET_CHARACTER_SET";
export type SET_CHARACTER_SET = typeof SET_CHARACTER_SET;

export interface CharacterInventoryData {}

type CharacterInventoryType =
  | SET_CHARACTER_STATUS
  | SET_VALID_CHARACTERS
  | SET_REJECTED_CHARACTERS
  | ADD_TO_VALID_CHARACTERS
  | ADD_TO_REJECTED_CHARACTERS
  | SET_ALL_WORDS
  | SET_SELECTED_CHARACTER
  | SET_CHARACTER_SET;

//action types

export interface CharacterInventoryAction {
  type: CharacterInventoryType;
  payload: string[];
  characterSet?: listChar[];
  character?: string;
  status?: characterStatus;
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

export function setCharacterStatus(
  character: string,
  status: characterStatus
): CharacterInventoryAction {
  return {
    type: SET_CHARACTER_STATUS,
    character,
    status,
    payload: []
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

export function addToRejectedCharacters(
  chars: string[]
): CharacterInventoryAction {
  return {
    type: ADD_TO_REJECTED_CHARACTERS,
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
    let words = await backend.getFrontierWords();
    dispatch(setAllWords(words.map(word => word.vernacular)));
  };
}

export function setSelectedCharacter(
  character: string
): CharacterInventoryAction {
  return {
    type: SET_SELECTED_CHARACTER,
    payload: [character]
  };
}

export function setCharacterSet(
  characterSet: listChar[]
): CharacterInventoryAction {
  return {
    type: SET_CHARACTER_SET,
    payload: [],
    characterSet
  };
}

export function getAllCharacters(
  validCharacters: string[],
  rejectedCharacters: string[]
) {
  return async (
    dispatch: Dispatch<CharacterInventoryAction>,
    getState: () => StoreState
  ) => {
    let state = getState();
    let words = await backend.getFrontierWords();
    let characters: string[] = [];
    words.forEach(word => characters.push(...word.vernacular));
    characters = [...new Set(characters)];

    let characterSet: listChar[] = [];
    characters.forEach(letter => {
      characterSet.push({
        character: letter,
        occurences: countCharacterOccurences(
          letter,
          words.map(word => word.vernacular)
        ),
        status: getCharacterStatus(
          letter,
          state.currentProject.validCharacters,
          state.currentProject.rejectedCharacters
        )
      });
    });
    dispatch(setCharacterSet(characterSet));
  };
}

function countCharacterOccurences(char: string, words: string[]) {
  let count = 0;
  for (let word of words) {
    for (let letter of word) {
      if (letter === char) {
        count++;
      }
    }
  }
  return count;
}

function getCharacterStatus(
  char: string,
  validChars: string[],
  rejectedChars: string[]
): characterStatus {
  if (validChars.includes(char)) return "accepted";
  if (rejectedChars.includes(char)) return "rejected";
  return "undecided";
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
  project.validCharacters = state.characterInventoryState.characterSet
    .filter(character => character.status === "accepted")
    .map(character => character.character);
  project.rejectedCharacters = state.characterInventoryState.characterSet
    .filter(character => character.status === "rejected")
    .map(character => character.character);
  return project;
}

function updateCurrentGoal(state: StoreState): Goal {
  let history: Goal[] = state.goalsState.historyState.history;
  let currentGoal: CreateCharInv = history[history.length - 1] as CreateCharInv;
  // Nothing stored as goal data for now

  return currentGoal;
}
