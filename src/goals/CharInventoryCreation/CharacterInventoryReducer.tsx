import {
  SET_CHARACTER_INVENTORY,
  CharacterInventoryAction
} from "./CharacterInventoryActions";

export interface CharacterInventoryState {
  inventory: string[];
}

export const defaultState: CharacterInventoryState = {
  inventory: []
};

export const characterInventoryReducer = (
  state: CharacterInventoryState = defaultState,
  action: CharacterInventoryAction
): CharacterInventoryState => {
  switch (action.type) {
    case SET_CHARACTER_INVENTORY:
      let inv = [...new Set([...action.payload])]; // Prevents duplicate characters
      return { inventory: inv };
    default:
      return state;
  }
};
