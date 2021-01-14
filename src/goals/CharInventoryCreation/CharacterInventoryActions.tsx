import { Dispatch } from "react";
import { ThunkDispatch } from "redux-thunk";

import * as backend from "../../backend";
import { saveChanges } from "../../components/GoalTimeline/GoalsActions";
import { StoreState } from "../../types";
import { Goal } from "../../types/goals";
import { Project } from "../../types/project";
import { CreateCharInv } from "../CreateCharInv/CreateCharInv";
import {
  CharacterSetEntry,
  characterStatus,
} from "./CharacterInventoryReducer";

export enum CharacterInventoryType {
  ADD_TO_VALID_CHARACTERS = "ADD_TO_VALID_CHARACTERS",
  ADD_TO_REJECTED_CHARACTERS = "ADD_TO_REJECTED_CHARACTERS",
  SET_VALID_CHARACTERS = "SET_VALID_CHARACTERS",
  SET_REJECTED_CHARACTERS = "SET_REJECTED_CHARACTERS",
  SET_ALL_WORDS = "CHARINV_SET_ALL_WORDS",
  SET_SELECTED_CHARACTER = "SET_SELECTED_CHARACTER",
  SET_CHARACTER_SET = "SET_CHARACTER_SET",
}

export interface CharacterInventoryAction {
  type: CharacterInventoryType;
  payload: string[];
  characterSet?: CharacterSetEntry[];
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

export function uploadInventory() {
  return async (
    dispatch: ThunkDispatch<StoreState, any, CharacterInventoryAction>,
    getState: () => StoreState
  ) => {
    const state = getState();
    const updatedGoal = updateCurrentGoal(state);
    const goalHistory = state.goalsState.historyState.history;
    const updatedProject = updateCurrentProject(state);

    await saveChanges(updatedGoal, goalHistory, updatedProject, dispatch);
  };
}

function updateCurrentGoal(state: StoreState): Goal {
  const goalHistory = state.goalsState.historyState.history;
  const currentGoal = goalHistory[goalHistory.length - 1] as CreateCharInv;
  // Nothing stored as goal data for now
  return currentGoal;
}

function updateCurrentProject(state: StoreState): Project {
  const project = state.currentProject;
  project.validCharacters = state.characterInventoryState.validCharacters;
  project.rejectedCharacters = state.characterInventoryState.rejectedCharacters;
  return project;
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

export function fetchWords() {
  return async (dispatch: Dispatch<CharacterInventoryAction>) => {
    let words = await backend.getFrontierWords();
    dispatch(setAllWords(words.map((word) => word.vernacular)));
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
