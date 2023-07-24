import { Action, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { MergeUndoIds, Word } from "api/models";
import * as Backend from "backend";
import { getCurrentUser, getProjectId } from "backend/localStorage";
import router from "browserRouter";
import { defaultState } from "components/GoalTimeline/DefaultState";
import {
  MergeDupsData,
  MergesCompleted,
} from "goals/MergeDuplicates/MergeDupsTypes";
import {
  dispatchMergeStepData,
  fetchMergeDupsData,
} from "goals/MergeDuplicates/Redux/MergeDupsActions";
import { StoreActionTypes } from "rootActions";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";
import { Goal, GoalStatus, GoalType } from "types/goals";
import { Path } from "types/path";
import { convertEditToGoal } from "utilities/goalUtilities";

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
    setCurrentGoalIndexAction: (state, action) => {
      state.currentGoal.index = action.payload;
    },
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
    reset: () => defaultState,
    updateStepFromDataAction: (state) => {
      if (state.currentGoal.goalType === GoalType.MergeDups) {
        const currentGoalData = state.currentGoal.data as MergeDupsData;
        state.currentGoal.steps[state.currentGoal.currentStep] = {
          words: currentGoalData,
        };
      }
    },
  },
  extraReducers: (builder) =>
    builder.addCase(StoreActionTypes.RESET, () => defaultState),
});

export const actionType = (actionName: string) => {
  return `${goalSlice.name}/${actionName}Action`;
};

const {
  addCompletedMergeToGoalAction,
  incrementCurrentGoalStepAction,
  loadUserEditsAction,
  setCurrentGoalAction,
  setCurrentGoalIndexAction,
  setCurrentGoalsStateAction,
  setGoalDataAction,
  reset,
  updateStepFromDataAction,
} = goalSlice.actions;

// Action Creators
export function asyncAddCompletedMergeToGoal(
  completedMerge: MergeUndoIds
): PayloadAction {
  return addCompletedMergeToGoalAction(completedMerge);
}

export function incrementCurrentGoalStep(): Action {
  return incrementCurrentGoalStepAction();
}
export function loadUserEdits(history?: Goal[]): PayloadAction {
  return loadUserEditsAction(history ?? []);
}

export function setCurrentGoal(goal?: Goal): PayloadAction {
  if (goal == null) {
    return setCurrentGoalAction(new Goal());
  }
  return setCurrentGoalAction({ ...goal });
}

export function setCurrentGoalIndex(index: number): PayloadAction {
  return setCurrentGoalIndexAction(index);
}

export function setCurrentGoalStatus(status: GoalStatus): PayloadAction {
  return setCurrentGoalsStateAction(status);
}

export function setGoalData(goalData: Word[][]): PayloadAction {
  return setGoalDataAction(goalData);
}

export function updateStepFromData(): Action {
  return updateStepFromDataAction();
}

// Dispatch Functions

export function asyncCreateUserEdits() {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(loadUserEdits([]));
    await Backend.createUserEdit();
  };
}

export function asyncLoadExistingUserEdits(
  projectId: string,
  userEditId: string
) {
  return async (dispatch: StoreStateDispatch) => {
    const userEdit = await Backend.getUserEditById(projectId, userEditId);
    const history = userEdit.edits.map((e, index) =>
      convertEditToGoal(e, index)
    );
    dispatch(loadUserEdits(history));
  };
}

export function asyncGetUserEdits() {
  return async (dispatch: StoreStateDispatch) => {
    const projectId = getProjectId();
    if (projectId) {
      const userEditId = getUserEditId();

      if (userEditId) {
        await dispatch(asyncLoadExistingUserEdits(projectId, userEditId));
      } else {
        await dispatch(asyncCreateUserEdits());
      }
    }
  };
}

export function asyncAddGoal(goal: Goal) {
  return async (dispatch: StoreStateDispatch) => {
    const userEditId = getUserEditId();
    if (userEditId) {
      dispatch(setCurrentGoal(goal));

      // Check if this is a new goal.
      if (goal.index === -1) {
        const newIndex = await Backend.addGoalToUserEdit(userEditId, goal);
        // Load the new goal, but don't await, to allow a loading screen.
        dispatch(asyncLoadNewGoal({ ...goal, index: newIndex }, userEditId));
      }

      // Serve goal.
      router.navigate(Path.GoalCurrent);
    }
  };
}

export function asyncLoadNewGoal(goal: Goal, userEditId: string) {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    // Load data.
    dispatch(setCurrentGoal(goal));
    const goalData = await loadGoalData(goal);
    if (goalData.length > 0) {
      dispatch(setGoalData(goalData));
      dispatch(updateStepFromData());
      const updatedGoal = getState().goalsState.currentGoal;
      dispatch(dispatchStepData(updatedGoal));
      await Backend.addGoalToUserEdit(userEditId, updatedGoal);
      await saveCurrentStep(updatedGoal);
    }
    dispatch(setCurrentGoalStatus(GoalStatus.InProgress));
  };
}

export function asyncAdvanceStep() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const initialStep = getState().goalsState.currentGoal.currentStep;
    dispatch(incrementCurrentGoalStep());
    if (initialStep != getState().goalsState.currentGoal.currentStep) {
      // Update data.
      dispatch(updateStepFromData());
      // Dispatch to state.
      const updatedGoal = getState().goalsState.currentGoal;
      dispatch(dispatchStepData(updatedGoal));
      // Save to database.
      await saveCurrentStep(updatedGoal);
    } else {
      goalCleanup(getState().goalsState.currentGoal);
    }
  };
}

export function dispatchStepData(goal: Goal) {
  return (dispatch: StoreStateDispatch) => {
    switch (goal.goalType) {
      case GoalType.MergeDups:
        dispatch(dispatchMergeStepData(goal));
        break;
      default:
        break;
    }
  };
}

export function asyncUpdateGoal(goal: Goal) {
  return async (dispatch: StoreStateDispatch) => {
    const userEditId = getUserEditId();
    if (userEditId) {
      dispatch(setCurrentGoal(goal));
      await Backend.addGoalToUserEdit(userEditId, goal);
    }
  };
}

// Helper Functions

// Returns true if input goal updated.
export async function loadGoalData(goal: Goal): Promise<Word[][]> {
  switch (goal.goalType) {
    case GoalType.MergeDups:
      return await fetchMergeDupsData(goal);
    default:
      return [];
  }
}

function goalCleanup(goal: Goal): void {
  switch (goal.goalType) {
    case GoalType.MergeDups:
      router.navigate(Path.GoalNext);
      break;
    default:
      router.navigate(Path.Goals);
      break;
  }
}

export function getUserEditId(): string | undefined {
  const user = getCurrentUser();
  if (user) {
    const projectId = getProjectId();
    const projectIds = Object.keys(user.workedProjects);
    const key = projectIds.find((id) => id === projectId);
    if (key) {
      return user.workedProjects[key];
    }
  }
  return undefined;
}

async function saveCurrentStep(goal: Goal) {
  const userEditId = getUserEditId();
  if (userEditId) {
    const step = goal.steps[goal.currentStep];
    await Backend.addStepToGoal(userEditId, goal.index, step, goal.currentStep);
  }
}

export default goalSlice.reducer;
