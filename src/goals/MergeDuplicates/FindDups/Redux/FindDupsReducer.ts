import { createSlice } from "@reduxjs/toolkit";

import {
  defaultState,
  FindDupsStatus,
} from "goals/MergeDuplicates/FindDups/Redux/FindDupsReduxTypes.ts";
import { StoreActionTypes } from "rootRedux/actions";

const findDupsSlice = createSlice({
  name: "findDupsState",
  initialState: defaultState,
  reducers: {
    inProgressAction: (state, action) => {
      state.projectId = action.payload;
      state.status = FindDupsStatus.InProgress;
    },
    failureAction: (state, action) => {
      state.projectId = action.payload;
      state.status = FindDupsStatus.Failure;
    },
    resetFindDupsAction: () => defaultState,
    successAction: (state, action) => {
      state.projectId = action.payload;
      state.status = FindDupsStatus.Success;
    },
  },
  extraReducers: (builder) =>
    builder.addCase(StoreActionTypes.RESET, () => defaultState),
});

export const {
  inProgressAction,
  failureAction,
  resetFindDupsAction,
  successAction,
} = findDupsSlice.actions;

export default findDupsSlice.reducer;
