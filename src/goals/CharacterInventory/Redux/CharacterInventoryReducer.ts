import { createSlice } from "@reduxjs/toolkit";

import {
  CharacterInventoryAction,
  CharacterInventoryType,
  CharacterInventoryState,
  CharacterSetEntry,
  getCharacterStatus,
  defaultState,
} from "goals/CharacterInventory/Redux/CharacterInventoryReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";

const exportProjectSlice = createSlice({
  name: "exportProjectState",
  initialState: defaultState,
  reducers: {
    downloadingAction: (state, action) => {
      state.projectId = action.payload;
      state.status = ExportStatus.Downloading;
    },
    exportingAction: (state, action) => {
      state.projectId = action.payload;
      state.status = ExportStatus.Exporting;
    },
    failureAction: (state, action) => {
      state.projectId = action.payload;
      state.status = ExportStatus.Failure;
    },
    resetAction: () => defaultState,
    successAction: (state, action) => {
      state.projectId = action.payload;
      state.status = ExportStatus.Success;
    },
  },
  extraReducers: (builder) =>
    builder.addCase(StoreActionTypes.RESET, () => defaultState),
});

export const {
  downloadingAction,
  exportingAction,
  failureAction,
  resetAction,
  successAction,
} = exportProjectSlice.actions;

export default exportProjectSlice.reducer;

export const characterInventoryReducer = (
  state: CharacterInventoryState = defaultState,
  action: StoreAction | CharacterInventoryAction
): CharacterInventoryState => {
  let validCharacters: string[];
  let rejectedCharacters: string[];
  let characterSet: CharacterSetEntry[];
  switch (action.type) {
    case CharacterInventoryType.SET_VALID_CHARACTERS:
      // Set prevents duplicate characters
      validCharacters = [...new Set(action.payload)];
      rejectedCharacters = state.rejectedCharacters.filter(
        (char) => !validCharacters.includes(char)
      );

      // Set status of characters in character set
      characterSet = state.characterSet.map((entry) => {
        entry.status = getCharacterStatus(
          entry.character,
          validCharacters,
          rejectedCharacters
        );
        return entry;
      });
      return { ...state, validCharacters, rejectedCharacters, characterSet };

    case CharacterInventoryType.SET_REJECTED_CHARACTERS:
      rejectedCharacters = [...new Set(action.payload)];
      validCharacters = state.validCharacters.filter(
        (char) => !rejectedCharacters.includes(char)
      );

      // Set status of characters in character set
      characterSet = state.characterSet.map((entry) => {
        entry.status = getCharacterStatus(
          entry.character,
          validCharacters,
          rejectedCharacters
        );
        return entry;
      });
      return { ...state, validCharacters, rejectedCharacters, characterSet };

    case CharacterInventoryType.ADD_TO_VALID_CHARACTERS:
      validCharacters = [
        ...new Set(state.validCharacters.concat(action.payload)),
      ];
      rejectedCharacters = state.rejectedCharacters.filter(
        (char) => !validCharacters.includes(char)
      );

      // Set status of characters in character set
      characterSet = state.characterSet.map((entry) => {
        entry.status = getCharacterStatus(
          entry.character,
          validCharacters,
          rejectedCharacters
        );
        return entry;
      });
      return { ...state, validCharacters, rejectedCharacters, characterSet };

    case CharacterInventoryType.ADD_TO_REJECTED_CHARACTERS:
      rejectedCharacters = [
        ...new Set(state.rejectedCharacters.concat(action.payload)),
      ];
      validCharacters = state.validCharacters.filter(
        (char) => !rejectedCharacters.includes(char)
      );

      // Set status of characters in character set
      characterSet = state.characterSet.map((entry) => {
        entry.status = getCharacterStatus(
          entry.character,
          validCharacters,
          rejectedCharacters
        );
        return entry;
      });
      return { ...state, validCharacters, rejectedCharacters, characterSet };

    case CharacterInventoryType.SET_SELECTED_CHARACTER:
      return { ...state, selectedCharacter: action.payload[0] };

    case CharacterInventoryType.SET_ALL_WORDS:
      return { ...state, allWords: action.payload };

    case CharacterInventoryType.SET_CHARACTER_SET:
      return action.characterSet
        ? { ...state, characterSet: action.characterSet }
        : state;

    case CharacterInventoryType.RESET:
      return defaultState;

    case StoreActionTypes.RESET:
      return defaultState;

    default:
      return state;
  }
};
