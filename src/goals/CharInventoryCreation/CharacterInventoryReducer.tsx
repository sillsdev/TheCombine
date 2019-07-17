import {
  SET_ACCEPTED_CHARACTERS,
  CharacterInventoryAction,
  SET_REJECTED_CHARACTERS,
  ADD_TO_ACCEPTED_CHARACTERS
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
  let acceptedCharacters: string[], rejectedCharacters: string[];
  switch (action.type) {
    case SET_ACCEPTED_CHARACTERS:
      // Set prevents duplicate characters
      acceptedCharacters = [...new Set(action.payload)];
      rejectedCharacters = state.rejectedCharacters.filter(
        char => !acceptedCharacters.includes(char)
      );
      return { ...state, acceptedCharacters, rejectedCharacters };
    case SET_REJECTED_CHARACTERS:
      // Set prevents duplicate characters
      rejectedCharacters = [...new Set(action.payload)];
      acceptedCharacters = state.acceptedCharacters.filter(
        char => !rejectedCharacters.includes(char)
      );
      return { ...state, acceptedCharacters, rejectedCharacters };
    case ADD_TO_ACCEPTED_CHARACTERS:
      // Set prevents duplicate characters
      acceptedCharacters = [
        ...new Set(state.acceptedCharacters.concat(action.payload))
      ];
      rejectedCharacters = state.rejectedCharacters.filter(
        char => !acceptedCharacters.includes(char)
      );
      return { ...state, acceptedCharacters, rejectedCharacters };

    default:
      return state;
  }
};
