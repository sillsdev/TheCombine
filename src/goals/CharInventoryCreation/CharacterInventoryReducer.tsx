import {
  SET_VALID_CHARACTERS,
  CharacterInventoryAction,
  SET_REJECTED_CHARACTERS,
  ADD_TO_VALID_CHARACTERS
} from "./CharacterInventoryActions";

export interface CharacterInventoryState {
  validCharacters: string[];
  rejectedCharacters: string[];
}

export const defaultState: CharacterInventoryState = {
  validCharacters: [],
  rejectedCharacters: []
};

export const characterInventoryReducer = (
  state: CharacterInventoryState = defaultState,
  action: CharacterInventoryAction
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

    default:
      return state;
  }
};
