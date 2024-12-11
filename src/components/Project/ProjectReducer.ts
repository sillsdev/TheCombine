import { createSlice } from "@reduxjs/toolkit";

import { defaultState } from "components/Project/ProjectReduxTypes";
import { StoreActionTypes } from "rootRedux/actions";

const projectSlice = createSlice({
  name: "currentProjectState",
  initialState: defaultState,
  reducers: {
    resetAction: () => defaultState,
    setColumnOrderAction: (state, action) => {
      const columns = state.reviewEntriesColumns;
      // Payload is a state updater, which can either be a new state
      // or a function that takes the previous state and returns a new state.
      if (typeof action.payload === "function") {
        columns.columnOrder = action.payload(columns.columnOrder);
      } else {
        columns.columnOrder = action.payload;
      }
    },
    setColumnVisibilityAction: (state, action) => {
      const columns = state.reviewEntriesColumns;
      // Payload is a state updater, which can either be a new state
      // or a function that takes the previous state and returns a new state.
      if (typeof action.payload === "function") {
        columns.columnVisibility = action.payload(columns.columnVisibility);
      } else {
        columns.columnVisibility = action.payload;
      }
    },
    setProjectAction: (state, action) => {
      if (state.project.id !== action.payload.id) {
        state.reviewEntriesColumns = defaultState.reviewEntriesColumns;
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
  setColumnOrderAction,
  setColumnVisibilityAction,
  setProjectAction,
  setSemanticDomainsAction,
  setSpeakerAction,
  setUsersAction,
} = projectSlice.actions;

export default projectSlice.reducer;
