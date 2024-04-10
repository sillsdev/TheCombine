import { createSlice } from "@reduxjs/toolkit";

import { defaultState } from "components/Project/ProjectReduxTypes";
import { StoreActionTypes } from "rootRedux/rootActions";

const projectSlice = createSlice({
  name: "currentProjectState",
  initialState: defaultState,
  reducers: {
    resetAction: () => defaultState,
    setProjectAction: (state, action) => {
      if (state.project.id !== action.payload.id) {
        state.speaker = undefined;
        state.users = [];
      }
      state.project = action.payload;
    },
    setSemanticDomainsAction: (state, action) => {
      state.semanticDomains = action.payload;
    },
    setSpeakerAction: (state, action) => {
      state.speaker = action.payload;
    },
    setUsersAction: (state, action) => {
      state.users = action.payload;
    },
  },
  extraReducers: (builder) =>
    builder.addCase(StoreActionTypes.RESET, () => defaultState),
});

export const {
  resetAction,
  setProjectAction,
  setSemanticDomainsAction,
  setSpeakerAction,
  setUsersAction,
} = projectSlice.actions;

export default projectSlice.reducer;
