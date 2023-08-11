import { createSlice } from "@reduxjs/toolkit";

import { defaultState } from "components/GoalTimeline/DefaultState";
import {
  MergeDupsData,
  MergesCompleted,
} from "goals/MergeDuplicates/MergeDupsTypes";
import { StoreActionTypes } from "rootActions";
import { GoalType } from "types/goals";

export const goalSlice = createSlice({
  name: "goalsState",
  initialState: defaultState,
  reducers: {
    addCompletedMergeToGoalAction: (state, action) => {
      if (state.currentGoal.goalType == GoalType.MergeDups) {
        const changes = { ...state.currentGoal.changes } as MergesCompleted;
        if (!changes.merges) {
          changes.merges = [];
        }
        changes.merges.push(action.payload);
        state.currentGoal.changes = changes;
      }
    },
    incrementCurrentGoalStepAction: (state) => {
      if (state.currentGoal.currentStep + 1 < state.currentGoal.numSteps) {
        state.currentGoal.currentStep++;
      }
    },
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
    // setCurrentGoalIndexAction: (state, action) => {
    //   state.currentGoal.index = action.payload;
    // },
    setCurrentGoalsStateAction: (state, action) => {
      state.currentGoal.status = action.payload;
    },
    setGoalDataAction: (state, action) => {
      if (action.payload.length > 0) {
        state.currentGoal.data = { plannedWords: action.payload };
        state.currentGoal.numSteps = action.payload.length;
        state.currentGoal.currentStep = 0;
        state.currentGoal.steps = [];
      }
    },
    updateStepFromDataAction: (state) => {
      if (state.currentGoal.goalType === GoalType.MergeDups) {
        const currentGoalData = state.currentGoal.data as MergeDupsData;
        state.currentGoal.steps[state.currentGoal.currentStep] = {
          words: currentGoalData.plannedWords[state.currentGoal.currentStep],
        };
      }
    },
  },
  extraReducers: (builder) =>
    builder.addCase(StoreActionTypes.RESET, () => defaultState),
});

// export const actionType = (actionName: string) => {
//   return `${goalSlice.name}/${actionName}Action`;
// };

export const {
  addCompletedMergeToGoalAction,
  incrementCurrentGoalStepAction,
  loadUserEditsAction,
  setCurrentGoalAction,
  // setCurrentGoalIndexAction,
  setCurrentGoalsStateAction,
  setGoalDataAction,
  updateStepFromDataAction,
} = goalSlice.actions;

export const goalsReducer = goalSlice.reducer;
