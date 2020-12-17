import { Dispatch } from "react";

import * as backend from "../../backend";
import { getCurrentUser } from "../../backend/localStorage";
import {
  ProjectAction,
  setCurrentProject,
} from "../../components/Project/ProjectActions";
import {
  getIndexInHistory,
  getUserEditId,
  GoalAction,
  updateGoal,
} from "../../components/GoalTimeline/GoalsActions";
import { StoreState } from "../../types";
import { Goal } from "../../types/goals";
import { Project } from "../../types/project";
import { User } from "../../types/user";
import { CreateCharInv } from "../CreateCharInv/CreateCharInv";
import {
  CharacterSetEntry,
  characterStatus,
} from "./CharacterInventoryReducer";

export enum CharacterInventoryType {
  SET_VALID_CHARACTERS = "SET_VALID_CHARACTERS",
  SET_REJECTED_CHARACTERS = "SET_REJECTED_CHARACTERS",
  ADD_TO_VALID_CHARACTERS = "ADD_TO_VALID_CHARACTERS",
  ADD_TO_REJECTED_CHARACTERS = "ADD_TO_REJECTED_CHARACTERS",
  SET_ALL_WORDS = "CHARINV_SET_ALL_WORDS",
  SET_SELECTED_CHARACTER = "SET_SELECTED_CHARACTER",
  SET_CHARACTER_SET = "SET_CHARACTER_SET",
}

//action types

export interface CharacterInventoryAction {
  type: CharacterInventoryType;
  payload: string[];
  characterSet?: CharacterSetEntry[];
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

export function setCharacterStatus(character: string, status: characterStatus) {
  return (
    dispatch: Dispatch<CharacterInventoryAction>,
    getState: () => StoreState
  ) => {
    if (status === "accepted") dispatch(addToValidCharacters([character]));
    else if (status === "rejected")
      dispatch(addToRejectedCharacters([character]));
    else if (status === "undecided") {
      let state = getState();

      let validCharacters = state.characterInventoryState.validCharacters.filter(
        (c) => c !== character
      );
      dispatch(setValidCharacters(validCharacters));

      let rejectedCharacters = state.characterInventoryState.rejectedCharacters.filter(
        (c) => c !== character
      );
      dispatch(setRejectedCharacters(rejectedCharacters));
    }
  };
}

export function addToValidCharacters(
  chars: string[]
): CharacterInventoryAction {
  return {
    type: CharacterInventoryType.ADD_TO_VALID_CHARACTERS,
    payload: chars,
  };
}

export function addToRejectedCharacters(
  chars: string[]
): CharacterInventoryAction {
  return {
    type: CharacterInventoryType.ADD_TO_REJECTED_CHARACTERS,
    payload: chars,
  };
}

export function setValidCharacters(chars: string[]): CharacterInventoryAction {
  return {
    type: CharacterInventoryType.SET_VALID_CHARACTERS,
    payload: chars,
  };
}

export function setRejectedCharacters(
  chars: string[]
): CharacterInventoryAction {
  return {
    type: CharacterInventoryType.SET_REJECTED_CHARACTERS,
    payload: chars,
  };
}

export function setAllWords(words: string[]): CharacterInventoryAction {
  return {
    type: CharacterInventoryType.SET_ALL_WORDS,
    payload: words,
  };
}

export function fetchWords() {
  return async (dispatch: Dispatch<CharacterInventoryAction>) => {
    let words = await backend.getFrontierWords();
    dispatch(setAllWords(words.map((word) => word.vernacular)));
  };
}

export function setSelectedCharacter(
  character: string
): CharacterInventoryAction {
  return {
    type: CharacterInventoryType.SET_SELECTED_CHARACTER,
    payload: [character],
  };
}

export function setCharacterSet(
  characterSet: CharacterSetEntry[]
): CharacterInventoryAction {
  return {
    type: CharacterInventoryType.SET_CHARACTER_SET,
    payload: [],
    characterSet,
  };
}

export function getAllCharacters() {
  return async (
    dispatch: Dispatch<CharacterInventoryAction>,
    getState: () => StoreState
  ) => {
    let state = getState();
    let words = await backend.getFrontierWords();
    let characters: string[] = [];
    words.forEach((word) => characters.push(...word.vernacular));
    characters = [...new Set(characters)];

    let characterSet: CharacterSetEntry[] = [];
    characters.forEach((letter) => {
      characterSet.push({
        character: letter,
        occurrences: countCharacterOccurences(
          letter,
          words.map((word) => word.vernacular)
        ),
        status: getCharacterStatus(
          letter,
          state.currentProject.validCharacters,
          state.currentProject.rejectedCharacters
        ),
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

export function getCharacterStatus(
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
  const user: User | null = getCurrentUser();
  if (user) {
    const userEditId: string | undefined = getUserEditId(user);
    if (userEditId !== undefined) {
      const goalIndex = getIndexInHistory(history, updatedGoal);
      dispatch(updateGoal(updatedGoal));
      await backend
        .addStepToGoal(userEditId, goalIndex, updatedGoal)
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
