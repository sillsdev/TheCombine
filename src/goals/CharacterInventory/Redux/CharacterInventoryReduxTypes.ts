import { CharacterStatus } from "goals/CharacterInventory/CharacterInventoryTypes";

export enum CharacterInventoryType {
  SET_VALID_CHARACTERS = "SET_VALID_CHARACTERS",
  SET_REJECTED_CHARACTERS = "SET_REJECTED_CHARACTERS",
  ADD_TO_VALID_CHARACTERS = "ADD_TO_VALID_CHARACTERS",
  ADD_TO_REJECTED_CHARACTERS = "ADD_TO_REJECTED_CHARACTERS",
  SET_ALL_WORDS = "SET_ALL_WORDS",
  SET_SELECTED_CHARACTER = "SET_SELECTED_CHARACTER",
  SET_CHARACTER_SET = "SET_CHARACTER_SET",
  RESET = "CHAR_INV_RESET",
}

// Utility function for returning a CharacterStatus from arrays of character data
export function getCharacterStatus(
  char: string,
  validChars: string[],
  rejectedChars: string[]
): CharacterStatus {
  if (validChars.includes(char)) {
    return CharacterStatus.Accepted;
  }
  if (rejectedChars.includes(char)) {
    return CharacterStatus.Rejected;
  }
  return CharacterStatus.Undecided;
}

export interface CharacterInventoryAction {
  type: CharacterInventoryType;
  payload: string[];
  characterSet?: CharacterSetEntry[];
}

export interface CharacterInventoryState {
  validCharacters: string[];
  rejectedCharacters: string[];
  allWords: string[];
  selectedCharacter: string;
  characterSet: CharacterSetEntry[];
}

export const defaultState: CharacterInventoryState = {
  validCharacters: [],
  rejectedCharacters: [],
  allWords: [],
  selectedCharacter: "",
  characterSet: [],
};

/** A character with its occurrences and status,
 * for sorting and filtering in a list */
export interface CharacterSetEntry {
  character: string;
  occurrences: number;
  status: CharacterStatus;
}

export function newCharacterSetEntry(character: string): CharacterSetEntry {
  return { character, occurrences: 0, status: CharacterStatus.Undecided };
}
