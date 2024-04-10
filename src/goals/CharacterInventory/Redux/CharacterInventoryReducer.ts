import { createSlice } from "@reduxjs/toolkit";

import {
  getCharacterStatus,
  defaultState,
} from "goals/CharacterInventory/Redux/CharacterInventoryReduxTypes";
import { StoreActionTypes } from "rootRedux/rootActions";

const characterInventorySlice = createSlice({
  name: "characterInventoryState",
  initialState: defaultState,
  reducers: {
    addRejectedCharacterAction: (state, action) => {
      if (!state.rejectedCharacters.includes(action.payload)) {
        state.rejectedCharacters.push(action.payload);
      }

      const index = state.validCharacters.findIndex((c) => c == action.payload);
      if (index > -1) {
        state.validCharacters.splice(index, 1);
      }

      const entry = state.characterSet.find(
        (e) => e.character === action.payload
      );
      if (entry) {
        entry.status = getCharacterStatus(
          entry.character,
          state.validCharacters,
          state.rejectedCharacters
        );
      }
    },
    addValidCharacterAction: (state, action) => {
      if (!state.validCharacters.includes(action.payload)) {
        state.validCharacters.push(action.payload);
      }

      const index = state.rejectedCharacters.findIndex(
        (c) => c == action.payload
      );
      if (index > -1) {
        state.rejectedCharacters.splice(index, 1);
      }

      const entry = state.characterSet.find(
        (e) => e.character === action.payload
      );
      if (entry) {
        entry.status = getCharacterStatus(
          entry.character,
          state.validCharacters,
          state.rejectedCharacters
        );
      }
    },
    resetCharInvAction: () => defaultState,
    setAllWordsAction: (state, action) => {
      state.allWords = action.payload;
    },
    setCharacterSetAction: (state, action) => {
      if (action.payload) {
        state.characterSet = action.payload;
      }
    },
    setRejectedCharactersAction: (state, action) => {
      state.rejectedCharacters = [...new Set(action.payload as string[])];
      state.validCharacters = state.validCharacters.filter(
        (char) => !state.rejectedCharacters.includes(char)
      );
      for (const entry of state.characterSet) {
        entry.status = getCharacterStatus(
          entry.character,
          state.validCharacters,
          state.rejectedCharacters
        );
      }
    },
    setSelectedCharacterAction: (state, action) => {
      state.selectedCharacter = action.payload;
    },
    setValidCharactersAction: (state, action) => {
      state.validCharacters = [...new Set(action.payload as string[])];
      state.rejectedCharacters = state.rejectedCharacters.filter(
        (char) => !state.validCharacters.includes(char)
      );
      for (const entry of state.characterSet) {
        entry.status = getCharacterStatus(
          entry.character,
          state.validCharacters,
          state.rejectedCharacters
        );
      }
    },
  },
  extraReducers: (builder) =>
    builder.addCase(StoreActionTypes.RESET, () => defaultState),
});

export const {
  addRejectedCharacterAction,
  addValidCharacterAction,
  resetCharInvAction,
  setAllWordsAction,
  setCharacterSetAction,
  setRejectedCharactersAction,
  setSelectedCharacterAction,
  setValidCharactersAction,
} = characterInventorySlice.actions;

export default characterInventorySlice.reducer;
