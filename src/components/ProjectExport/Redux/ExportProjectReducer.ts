import { createSlice } from "@reduxjs/toolkit";

import {
  defaultState,
  ExportStatus,
} from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { StoreActionTypes } from "rootRedux/actions";

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
    resetExportAction: () => defaultState,
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
  resetExportAction,
  successAction,
} = exportProjectSlice.actions;

export default exportProjectSlice.reducer;
