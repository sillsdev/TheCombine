import {
  SET_ACCEPTED_CHARACTERS,
  CharacterInventoryAction,
  SET_REJECTED_CHARACTERS
} from "./CharacterInventoryActions";

export interface CharacterInventoryState {
  acceptedCharacters: string[];
  rejectedCharacters: string[];
}

export const defaultState: CharacterInventoryState = {
  acceptedCharacters: [],
  rejectedCharacters: []
};

export const characterInventoryReducer = (
  state: CharacterInventoryState = defaultState,
  action: CharacterInventoryAction
): CharacterInventoryState => {
  let chars;
  switch (action.type) {
    case SET_ACCEPTED_CHARACTERS:
      chars = [...new Set([...action.payload])]; // Prevents duplicate characters
      return { ...state, acceptedCharacters: chars };
    case SET_REJECTED_CHARACTERS:
      chars = [...new Set([...action.payload])]; // Prevents duplicate characters
      return { ...state, rejectedCharacters: chars };
    default:
      return state;
  }
};
