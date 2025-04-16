import { createSlice } from "@reduxjs/toolkit";

import {
  defaultState,
  FindDupsStatus,
} from "goals/MergeDuplicates/FindDups/Redux/FindDupsReduxTypes";
import { StoreActionTypes } from "rootRedux/actions";

const findDupsSlice = createSlice({
  name: "findDupsState",
  initialState: defaultState,
  reducers: {
    inProgressAction: (state) => {
      state.status = FindDupsStatus.InProgress;
    },
    failureAction: (state) => {
      state.status = FindDupsStatus.Failure;
    },
    resetFindDupsAction: () => defaultState,
    successAction: (state) => {
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
