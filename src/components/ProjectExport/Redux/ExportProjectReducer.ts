import { createSlice } from "@reduxjs/toolkit";

import {
  defaultState,
  ExportStatus,
} from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { StoreActionTypes } from "rootActions";

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
    resetAction: (state) => {
      state.projectId = "";
      state.status = ExportStatus.Default;
    },
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
