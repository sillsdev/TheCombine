import * as backend from "backend";
import { saveChangesToProject } from "components/Project/ProjectActions";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";
import { Project } from "types/project";
import {
  CharacterSetEntry,
  characterStatus,
} from "goals/CharInventoryCreation/CharacterInventoryReducer";

export enum CharacterInventoryType {
  SET_VALID_CHARACTERS = "SET_VALID_CHARACTERS",
  SET_REJECTED_CHARACTERS = "SET_REJECTED_CHARACTERS",
  ADD_TO_VALID_CHARACTERS = "ADD_TO_VALID_CHARACTERS",
  ADD_TO_REJECTED_CHARACTERS = "ADD_TO_REJECTED_CHARACTERS",
  SET_ALL_WORDS = "CHARINV_SET_ALL_WORDS",
  SET_SELECTED_CHARACTER = "SET_SELECTED_CHARACTER",
  SET_CHARACTER_SET = "SET_CHARACTER_SET",
  RESET = "CHARINV_RESET",
}

export interface CharacterInventoryAction {
  type: CharacterInventoryType;
  payload: string[];
  characterSet?: CharacterSetEntry[];
}

// Action Creators

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

export function resetInState(): CharacterInventoryAction {
  return {
    type: CharacterInventoryType.RESET,
    payload: [],
  };
}

// Dispatch Functions

export function setCharacterStatus(character: string, status: characterStatus) {
  return (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    if (status === "accepted") dispatch(addToValidCharacters([character]));
    else if (status === "rejected")
      dispatch(addToRejectedCharacters([character]));
    else if (status === "undecided") {
      const state = getState();

      const validCharacters = state.characterInventoryState.validCharacters.filter(
        (c) => c !== character
      );
      dispatch(setValidCharacters(validCharacters));

      const rejectedCharacters = state.characterInventoryState.rejectedCharacters.filter(
        (c) => c !== character
      );
      dispatch(setRejectedCharacters(rejectedCharacters));
    }
  };
}

// Sends the character inventory to the server.
export function uploadInventory() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const state = getState();
    const updatedProject = updateCurrentProject(state);
    await saveChangesToProject(updatedProject, dispatch);
  };
}

export function fetchWords() {
  return async (dispatch: StoreStateDispatch) => {
    const words = await backend.getFrontierWords();
    dispatch(setAllWords(words.map((word) => word.vernacular)));
  };
}

export function getAllCharacters() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const state = getState();
    const words = await backend.getFrontierWords();
    const charactersWithDuplicates: string[] = [];
    words.forEach((word) => charactersWithDuplicates.push(...word.vernacular));
    const characters = [...new Set(charactersWithDuplicates)];

    const characterSet: CharacterSetEntry[] = [];
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

// Helper Functions

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

function updateCurrentProject(state: StoreState): Project {
  const project = state.currentProject;
  project.validCharacters = state.characterInventoryState.validCharacters;
  project.rejectedCharacters = state.characterInventoryState.rejectedCharacters;
  return project;
}
