import { createSlice } from "@reduxjs/toolkit";

import { defaultState } from "goals/ReviewEntries/Redux/ReviewEntriesReduxTypes";
import { StoreActionTypes } from "Redux/rootActions";

const reviewEntriesSlice = createSlice({
  name: "reviewEntriesState",
  initialState: defaultState,
  reducers: {
    deleteWordAction: (state, action) => {
      state.words = state.words.filter((w) => w.id !== action.payload);
    },
    resetReviewEntriesAction: () => defaultState,
    setAllWordsAction: (state, action) => {
      state.words = action.payload;
    },
    setSortByAction: (state, action) => {
      state.sortBy = action.payload;
    },
    updateWordAction: (state, action) => {
      state.words = state.words.map((w) =>
        w.id === action.payload.oldId ? action.payload.updatedWord : w
      );
    },
  },
  extraReducers: (builder) =>
    builder.addCase(StoreActionTypes.RESET, () => defaultState),
});

export const {
  deleteWordAction,
  resetReviewEntriesAction,
  setAllWordsAction,
  setSortByAction,
  updateWordAction,
} = reviewEntriesSlice.actions;

export default reviewEntriesSlice.reducer;
