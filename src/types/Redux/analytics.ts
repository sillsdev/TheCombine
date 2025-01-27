import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { StoreActionTypes } from "rootRedux/actions";
import { defaultState } from "types/Redux/analyticsReduxTypes";

const analyticsSlice = createSlice({
  name: "analyticsState",
  initialState: defaultState,
  reducers: {
    changePageAction: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) =>
    builder.addCase(StoreActionTypes.RESET, () => defaultState),
});

const { changePageAction } = analyticsSlice.actions;

export default analyticsSlice.reducer;

export function changePage(newPage: string): PayloadAction {
  return changePageAction(newPage);
}
