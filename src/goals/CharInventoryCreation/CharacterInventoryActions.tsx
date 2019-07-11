import { Dispatch } from "react";
import { StoreState } from "../../types";
import {
  setCurrentProject,
  ProjectAction
} from "../../components/Project/ProjectActions";
import { updateProject } from "../../backend";
import {
  updateGoal,
  UpdateGoalAction,
  getUserEditId,
  getIndexInHistory
} from "../../components/GoalTimeline/GoalsActions";
import { CreateCharInv } from "../CreateCharInv/CreateCharInv";
import * as backend from "../../backend";
import { Goal } from "../../types/goals";
import { UserProject } from "../../components/Project/UserProject";

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
    dispatch: Dispatch<
      CharacterInventoryAction | ProjectAction | UpdateGoalAction
    >,
    getState: () => StoreState
  ) => {
    let project = getState().currentProject;
    let inv = getState().characterInventoryState.inventory;
    project.characterSet = inv;

    // Update goal
    let history: Goal[] = getState().goalsState.historyState.history;
    let currentGoal: CreateCharInv = history[
      history.length - 1
    ] as CreateCharInv;
    currentGoal.data = {
      inventory: [[...inv]]
    };
    let projectId: string = backend.getProjectId();
    let userEditId: string = getUserEditId();
    let userProject: UserProject = {
      projectId: projectId,
      userEditId: userEditId
    };

    let indexInHistory: number = getIndexInHistory(history, currentGoal);

    dispatch(updateGoal(currentGoal));
    await backend
      .addStepToGoal(userProject, indexInHistory, currentGoal)
      .catch((err: string) => console.log(err));

    updateProject(project);

    dispatch(setCurrentProject(project));
  };
}

export function setInventory(payload: string[]): CharacterInventoryAction {
  return {
    type: SET_CHARACTER_INVENTORY,
    payload
  };
}
