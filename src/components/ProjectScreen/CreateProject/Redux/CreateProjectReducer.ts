import { createSlice } from "@reduxjs/toolkit";

import { defaultState } from "components/ProjectScreen/CreateProject/Redux/CreateProjectReduxTypes";
import { StoreActionTypes } from "rootActions";

const createProjectSlice = createSlice({
  name: "goalsState",
  initialState: defaultState,
  /* eslint-disable @typescript-eslint/no-unused-vars */
  reducers: {
    failureAction: (state, action) => {
      state = { ...defaultState, errorMsg: action.payload.errorMsg ?? "" };
    },
    inProgressAction: (state) => {
      state = { ...defaultState, inProgress: true };
    },
    resetAction: (state) => {
      state = defaultState;
    },
    successAction: (state) => {
      state = { ...defaultState, success: true };
    },
  },
  /* eslint-enable @typescript-eslint/no-unused-vars */
  extraReducers: (builder) =>
    builder.addCase(StoreActionTypes.RESET, () => defaultState),
});

export const { failureAction, inProgressAction, resetAction, successAction } =
  createProjectSlice.actions;

export default createProjectSlice.reducer;
