import { createSlice } from "@reduxjs/toolkit";

import { defaultState } from "components/GoalTimeline/DefaultState";
import {
  MergeDupsData,
  MergesCompleted,
} from "goals/MergeDuplicates/MergeDupsTypes";
import {
  EntriesEdited,
  EntryEdit,
} from "goals/ReviewEntries/ReviewEntriesTypes";
import { StoreActionTypes } from "rootActions";
import { GoalType } from "types/goals";

const goalSlice = createSlice({
  name: "goalsState",
  initialState: defaultState,
  reducers: {
    addCharInvChangesToGoalAction: (state, action) => {
      if (state.currentGoal.goalType === GoalType.CreateCharInv) {
        state.currentGoal.changes = { charChanges: action.payload };
      }
    },
    addCompletedMergeToGoalAction: (state, action) => {
      if (
        state.currentGoal.goalType === GoalType.MergeDups ||
        state.currentGoal.goalType === GoalType.ReviewDeferredDups
      ) {
        const changes = { ...state.currentGoal.changes } as MergesCompleted;
        if (!changes.merges) {
          changes.merges = [];
        }
        changes.merges.push(action.payload);
        state.currentGoal.changes = changes;
      }
    },
    addEntryEditToGoalAction: (state, action) => {
      if (state.currentGoal.goalType === GoalType.ReviewEntries) {
        const changes = { ...state.currentGoal.changes } as EntriesEdited;
        if (!changes.entryEdits) {
          changes.entryEdits = [];
        }
        const newEdit = action.payload as EntryEdit;
        const oldEdit = changes.entryEdits.find(
          (e) => e.newId === newEdit.oldId
        );
        if (oldEdit) {
          oldEdit.newId = newEdit.newId;
        } else {
          changes.entryEdits.push(newEdit);
        }
        state.currentGoal.changes = changes;
      }
    },
    incrementGoalStepAction: (state) => {
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
    setGoalDataAction: (state, action) => {
      if (action.payload.length > 0) {
        state.currentGoal.data = { plannedWords: action.payload };
        state.currentGoal.numSteps = action.payload.length;
        state.currentGoal.currentStep = 0;
        state.currentGoal.steps = [];
      }
    },
    setGoalStatusAction: (state, action) => {
      state.currentGoal.status = action.payload;
    },
    updateStepFromDataAction: (state) => {
      if (
        state.currentGoal.goalType === GoalType.MergeDups ||
        state.currentGoal.goalType === GoalType.ReviewDeferredDups
      ) {
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

export const {
  addCharInvChangesToGoalAction,
  addCompletedMergeToGoalAction,
  addEntryEditToGoalAction,
  incrementGoalStepAction,
  loadUserEditsAction,
  setCurrentGoalAction,
  setGoalDataAction,
  setGoalStatusAction,
  updateStepFromDataAction,
} = goalSlice.actions;

export default goalSlice.reducer;
