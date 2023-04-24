import { createSlice } from "@reduxjs/toolkit";

import { defaultState } from "components/GoalTimeline/DefaultState";
import { GoalType } from "types/goals";

export const goalSlice = createSlice({
  name: "goal",
  initialState: defaultState,
  reducers: {
    loadUserEditsAction: (state, action) => {
      const history = [...action.payload];
      state.previousGoalType =
        history[history.length - 1]?.goalType ?? GoalType.Default;
      state.history = history;
    },
    setCurrentGoalAction: (state, action) => {
      state.currentGoal = action.payload;
      state.goalTypeSuggestions = state.goalTypeSuggestions.filter(
        (type, index) => index !== 0 || action.payload.goalType !== type
      ); // Remove top suggestion if same as goal to add.
      state.previousGoalType =
        state.currentGoal.goalType !== GoalType.Default
          ? state.currentGoal.goalType
          : state.previousGoalType;
    },
    setCurrentGoalIndexAction: (state, action) => {
      state.currentGoal.index = action.payload;
    },
    setCurrentGoalStatusAction: (state, action) => {
      state.currentGoal.status = action.payload;
    },
    reset: (state) => {
      state = defaultState;
    },
  },
});

export const {
  loadUserEditsAction,
  setCurrentGoalAction,
  setCurrentGoalIndexAction,
  setCurrentGoalStatusAction,
  reset,
} = goalSlice.actions;

export default goalSlice.reducer;
