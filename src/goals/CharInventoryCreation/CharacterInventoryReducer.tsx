import {
  SET_VALID_CHARACTERS,
  CharacterInventoryAction,
  SET_REJECTED_CHARACTERS,
  ADD_TO_VALID_CHARACTERS,
  SET_ALL_WORDS,
  SET_SELECTED_CHARACTER
} from "./CharacterInventoryActions";
import { StoreActions, StoreAction } from "../../rootActions";

export interface CharacterInventoryState {
  validCharacters: string[];
  rejectedCharacters: string[];
  allWords: string[];
  selectedCharacter: string;
}

export const defaultState: CharacterInventoryState = {
  validCharacters: [],
  rejectedCharacters: [],
  allWords: [],
  selectedCharacter: ""
};

export const characterInventoryReducer = (
  state: CharacterInventoryState = defaultState,
  action: StoreAction | CharacterInventoryAction
): CharacterInventoryState => {
  let validCharacters: string[], rejectedCharacters: string[];
  switch (action.type) {
    case SET_VALID_CHARACTERS:
      // Set prevents duplicate characters
      validCharacters = [...new Set(action.payload)];
      rejectedCharacters = state.rejectedCharacters.filter(
        char => !validCharacters.includes(char)
      );
      return { ...state, validCharacters: validCharacters, rejectedCharacters };
    case SET_REJECTED_CHARACTERS:
      // Set prevents duplicate characters
      rejectedCharacters = [...new Set(action.payload)];
      validCharacters = state.validCharacters.filter(
        char => !rejectedCharacters.includes(char)
      );
      return { ...state, validCharacters: validCharacters, rejectedCharacters };
    case ADD_TO_VALID_CHARACTERS:
      // Set prevents duplicate characters
      validCharacters = [
        ...new Set(state.validCharacters.concat(action.payload))
      ];
      rejectedCharacters = state.rejectedCharacters.filter(
        char => !validCharacters.includes(char)
      );
      return { ...state, validCharacters: validCharacters, rejectedCharacters };
    case SET_ALL_WORDS:
      return { ...state, allWords: action.payload };
    case SET_SELECTED_CHARACTER:
      return { ...state, selectedCharacter: action.payload[0] };
    case StoreActions.RESET:
      return defaultState;
    default:
      return state;
  }
};
