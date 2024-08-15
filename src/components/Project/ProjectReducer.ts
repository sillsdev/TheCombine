import { createSlice } from "@reduxjs/toolkit";

import { defaultState } from "components/Project/ProjectReduxTypes";
import { StoreActionTypes } from "rootRedux/actions";

const projectSlice = createSlice({
  name: "currentProjectState",
  initialState: defaultState,
  reducers: {
    resetAction: () => defaultState,
    setColumnOrderAction: (state, action) => {
      if (typeof action.payload === "function") {
        state.reviewEntriesColumns.columnOrder = action.payload(
          state.reviewEntriesColumns.columnOrder
        );
      } else {
        state.reviewEntriesColumns.columnOrder = action.payload;
      }
    },
    setColumnVisibilityAction: (state, action) => {
      if (typeof action.payload === "function") {
        state.reviewEntriesColumns.columnVisibility = action.payload(
          state.reviewEntriesColumns.columnVisibility
        );
      } else {
        state.reviewEntriesColumns.columnVisibility = action.payload;
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
