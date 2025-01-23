import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { getUserPreferences } from "vanilla-cookieconsent";

import { StoreActionTypes } from "rootRedux/actions";
import { defaultState } from "types/Redux/analyticsReduxTypes";

const analyticsSlice = createSlice({
  name: "analyticsState",
  initialState: defaultState,
  reducers: {
    changePageAction: (state, action) => {
      state.currentPage = action.payload;
    },
    updateConsentAction: (state) => {
      state.consent = getUserPreferences().acceptType === "all";
    },
  },
  extraReducers: (builder) =>
    builder.addCase(StoreActionTypes.RESET, () => defaultState),
});

const { changePageAction, updateConsentAction } = analyticsSlice.actions;

export default analyticsSlice.reducer;

export function changePage(newPage: string): PayloadAction {
  return changePageAction(newPage);
}

export function updateConsent(): PayloadAction {
  return updateConsentAction();
}
