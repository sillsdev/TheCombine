import { createSlice } from "@reduxjs/toolkit";

import { defaultState } from "components/Project/ProjectReduxTypes";
import { StoreActionTypes } from "rootActions";

const projectSlice = createSlice({
  name: "currentProjectState",
  initialState: defaultState,
  reducers: {
    resetAction: () => defaultState,
    setProjectAction: (state, action) => {
      if (state.project.id !== action.payload.id) {
        state.users = [];
      }
      state.project = action.payload;
    },
    setUsersAction: (state, action) => {
      state.users = action.payload;
    },
  },
  extraReducers: (builder) =>
    builder.addCase(StoreActionTypes.RESET, () => defaultState),
});

export const { resetAction, setProjectAction, setUsersAction } =
  projectSlice.actions;

export default projectSlice.reducer;
