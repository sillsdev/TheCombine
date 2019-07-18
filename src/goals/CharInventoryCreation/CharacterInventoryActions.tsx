import { Dispatch } from "react";
import { StoreState } from "../../types";
import {
  setCurrentProject,
  ProjectAction
} from "../../components/Project/ProjectActions";
import {
  updateGoal,
  getUserEditId,
  getIndexInHistory,
  GoalAction,
  getUser
} from "../../components/GoalTimeline/GoalsActions";
import { CreateCharInv } from "../CreateCharInv/CreateCharInv";
import * as backend from "../../backend";
import { Goal } from "../../types/goals";
import { Project } from "../../types/project";
import { User } from "../../types/user";

export const SET_CHARACTER_INVENTORY = "SET_CHARACTER_INVENTORY";
export type SET_CHARACTER_INVENTORY = typeof SET_CHARACTER_INVENTORY;

export interface CharacterInventoryData {}

type CharacterInventoryType = SET_CHARACTER_INVENTORY;

//action types

export interface CharacterInventoryAction {
  type: CharacterInventoryType;
  payload: string[];
}

/**
 * Sends the character inventory to the server
 */
export function uploadInventory() {
  return async (
    dispatch: Dispatch<CharacterInventoryAction | ProjectAction | GoalAction>,
    getState: () => StoreState
  ) => {
    let state: StoreState = getState();
    let project: Project = updateCurrentProject(state);
    let updatedGoal: Goal = updateCurrentGoal(state);
    let history: Goal[] = state.goalsState.historyState.history;

    await saveChanges(updatedGoal, history, project, dispatch);
  };
}

async function saveChanges(
  goal: Goal,
  history: Goal[],
  project: Project,
  dispatch: Dispatch<CharacterInventoryAction | ProjectAction | GoalAction>
) {
  await saveChangesToGoal(goal, history, dispatch);
  await saveChangesToProject(project, dispatch);
}

async function saveChangesToGoal(
  updatedGoal: Goal,
  history: Goal[],
  dispatch: Dispatch<CharacterInventoryAction | ProjectAction | GoalAction>
) {
  let user: User | undefined = getUser();
  if (user !== undefined) {
    let userEditId: string | undefined = getUserEditId(user);
    if (userEditId !== undefined) {
      let indexInHistory: number = getIndexInHistory(history, updatedGoal);

      dispatch(updateGoal(updatedGoal));
      await backend
        .addStepToGoal(userEditId, indexInHistory, updatedGoal)
        .catch((err: string) => console.log(err));
    }
  }
}

async function saveChangesToProject(
  project: Project,
  dispatch: Dispatch<CharacterInventoryAction | ProjectAction | GoalAction>
) {
  dispatch(setCurrentProject(project));
  await backend.updateProject(project);
}

function updateCurrentProject(state: StoreState): Project {
  let project = state.currentProject;
  let inv = state.characterInventoryState.inventory;
  project.characterSet = inv;
  return project;
}

function updateCurrentGoal(state: StoreState): Goal {
  let history: Goal[] = state.goalsState.historyState.history;
  let currentGoal: CreateCharInv = history[history.length - 1] as CreateCharInv;
  // Nothing stored as goal data for now

  return currentGoal;
}

export function setInventory(payload: string[]): CharacterInventoryAction {
  return {
    type: SET_CHARACTER_INVENTORY,
    payload
  };
}
