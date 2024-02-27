import { createSlice } from "@reduxjs/toolkit";

import { StoreActionTypes } from "Redux/rootActions";
import { defaultState } from "components/TreeView/Redux/TreeViewReduxTypes";

const treeViewSlice = createSlice({
  name: "treeViewState",
  initialState: defaultState,
  reducers: {
    resetTreeAction: () => defaultState,
    setCurrentDomainAction: (state, action) => {
      state.currentDomain = action.payload;
    },
    setDomainLanguageAction: (state, action) => {
      state.currentDomain.lang = action.payload;
      state.language = action.payload;
    },
    setTreeOpenAction: (state, action) => {
      state.open = action.payload;
    },
  },
  extraReducers: (builder) =>
    builder.addCase(StoreActionTypes.RESET, () => defaultState),
});

export const {
  resetTreeAction,
  setCurrentDomainAction,
  setDomainLanguageAction,
  setTreeOpenAction,
} = treeViewSlice.actions;

export default treeViewSlice.reducer;
