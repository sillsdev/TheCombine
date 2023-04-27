import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import * as Backend from "backend";
import { getCurrentUser, getProjectId } from "backend/localStorage";
import history, { Path } from "browserHistory";
import { defaultState } from "components/GoalTimeline/DefaultState";
import { MergeDupData } from "goals/MergeDupGoal/MergeDupsTypes";
import {
  dispatchMergeStepData,
  fetchMergeDupsData,
} from "goals/MergeDupGoal/Redux/MergeDupActions";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";
import { convertEditToGoal } from "types/goalUtilities";
import { Goal, GoalStatus, GoalType } from "types/goals";

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

// Remove 'export' and delete GoalActions.ts and GoalReducer.ts before
// merging with master branch.
const {
  loadUserEditsAction,
  setCurrentGoalAction,
  setCurrentGoalIndexAction,
  setCurrentGoalStatusAction,
  reset,
} = goalSlice.actions;

// Action Creators

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
  return setCurrentGoalStatusAction(status);
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
      history.push(Path.GoalCurrent);
    }
  };
}

export function asyncLoadNewGoal(goal: Goal, userEditId: string) {
  return async (dispatch: StoreStateDispatch) => {
    // Load data.
    if (await loadGoalData(goal)) {
      updateStepFromData(goal);
      dispatch(dispatchStepData(goal));
      await Backend.addGoalToUserEdit(userEditId, goal);
      await saveCurrentStep(goal);
    }

    dispatch(setCurrentGoal(goal));
    dispatch(setCurrentGoalStatus(GoalStatus.InProgress));
  };
}

export function asyncAdvanceStep() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const goalsState = getState().goalsState;
    // copy the goal so that we don't mutate the state directly.
    const goal = { ...goalsState.currentGoal };
    goal.currentStep++;
    if (goal.currentStep < goal.numSteps) {
      // Update data.
      updateStepFromData(goal);

      // Dispatch to state.
      dispatch(setCurrentGoal(goal));
      dispatch(dispatchStepData({ ...goal }));

      // Save to database.
      await saveCurrentStep(goal);
    } else {
      goalCleanup(goal);
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
export async function loadGoalData(goal: Goal): Promise<boolean> {
  switch (goal.goalType) {
    case GoalType.MergeDups:
      const mergeDupsData = await fetchMergeDupsData(goal);
      goal.data = { plannedWords: mergeDupsData };
      goal.numSteps = mergeDupsData.length;
      goal.currentStep = 0;
      goal.steps = [];
      return true;
    default:
      return false;
  }
}

// Returns true if input goal updated.
export function updateStepFromData(goal: Goal): boolean {
  switch (goal.goalType) {
    case GoalType.MergeDups:
      const currentGoalData = goal.data as MergeDupData;
      goal.steps[goal.currentStep] = {
        words: currentGoalData.plannedWords[goal.currentStep],
      };
      return true;
    default:
      return false;
  }
}

function goalCleanup(goal: Goal): void {
  switch (goal.goalType) {
    case GoalType.MergeDups:
      history.push(Path.GoalNext);
      break;
    default:
      history.push(Path.Goals);
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
