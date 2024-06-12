import { createSlice } from "@reduxjs/toolkit";

import {
  defaultState,
  PronunciationsStatus,
} from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { StoreActionTypes } from "rootRedux/actions";

const pronunciationsSlice = createSlice({
  name: "pronunciationsState",
  initialState: defaultState,
  reducers: {
    resetAction: () => defaultState,
    setPlayingAction: (state, action) => {
      state.fileName = action.payload;
      state.status = PronunciationsStatus.Playing;
      state.wordId = "";
    },
    setRecordingAction: (state, action) => {
      state.fileName = "";
      state.status = PronunciationsStatus.Recording;
      state.wordId = action.payload;
    },
  },
  extraReducers: (builder) =>
    builder.addCase(StoreActionTypes.RESET, () => defaultState),
});

export const { resetAction, setPlayingAction, setRecordingAction } =
  pronunciationsSlice.actions;

export default pronunciationsSlice.reducer;
