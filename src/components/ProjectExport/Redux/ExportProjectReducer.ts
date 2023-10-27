import { createSlice } from "@reduxjs/toolkit";

import {
  defaultState,
  ExportStatus,
} from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { StoreActionTypes } from "rootActions";

const exportProjectSlice = createSlice({
  name: "exportProjectState",
  initialState: defaultState,
  /* eslint-disable @typescript-eslint/no-unused-vars */
  reducers: {
    downloadingAction: (state, action) => {
      console.info("updating state to downloading");
      console.info(action);
      state = {
        ...defaultState,
        projectId: action.payload,
        status: ExportStatus.Downloading,
      };
      console.info(state);
    },
    exportingAction: (state, action) => {
      console.info("updating state to exporting");
      console.info(action);
      state = {
        ...defaultState,
        projectId: action.payload,
        status: ExportStatus.Exporting,
      };
      console.info(state);
    },
    failureAction: (state, action) => {
      state = {
        ...defaultState,
        projectId: action.payload,
        status: ExportStatus.Failure,
      };
    },
    resetAction: (state) => {
      state = { ...defaultState, status: ExportStatus.Default };
    },
    successAction: (state, action) => {
      state = {
        ...defaultState,
        projectId: action.payload,
        status: ExportStatus.Success,
      };
    },
  },
  /* eslint-enable @typescript-eslint/no-unused-vars */
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
