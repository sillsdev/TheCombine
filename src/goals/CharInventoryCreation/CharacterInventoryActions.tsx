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
  GoalAction
} from "../../components/GoalTimeline/GoalsActions";
import { CreateCharInv } from "../CreateCharInv/CreateCharInv";
import * as backend from "../../backend";
import { Goal } from "../../types/goals";
import { UserProjectMap } from "../../components/Project/UserProject";
import { Project } from "../../types/project";

export const SET_ACCEPTED_CHARACTERS = "SET_ACCEPTED_CHARACTERS";
export type SET_ACCEPTED_CHARACTERS = typeof SET_ACCEPTED_CHARACTERS;

export const SET_REJECTED_CHARACTERS = "SET_REJECTED_CHARACTERS";
export type SET_REJECTED_CHARACTERS = typeof SET_REJECTED_CHARACTERS;

export interface CharacterInventoryData {}

type CharacterInventoryType = SET_ACCEPTED_CHARACTERS | SET_REJECTED_CHARACTERS;

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

export function setAcceptedCharacters(
  payload: string[]
): CharacterInventoryAction {
  return {
    type: SET_ACCEPTED_CHARACTERS,
    payload
  };
}

export function setRejectedCharacters(
  payload: string[]
): CharacterInventoryAction {
  return {
    type: SET_REJECTED_CHARACTERS,
    payload
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
  let projectId: string = backend.getProjectId();
  let userEditId: string = getUserEditId();
  let userProjectMap: UserProjectMap = {
    projectId: projectId,
    userEditId: userEditId
  };
  let indexInHistory: number = getIndexInHistory(history, updatedGoal);

  dispatch(updateGoal(updatedGoal));
  await backend
    .addStepToGoal(userProjectMap, indexInHistory, updatedGoal)
    .catch((err: string) => console.log(err));
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
  project.validCharacters = state.characterInventoryState.acceptedCharacters;
  project.rejectedCharacters = state.characterInventoryState.rejectedCharacters;
  return project;
}

function updateCurrentGoal(state: StoreState): Goal {
  let history: Goal[] = state.goalsState.historyState.history;
  let currentGoal: CreateCharInv = history[history.length - 1] as CreateCharInv;
  // Nothing stored as goal data for now

  return currentGoal;
}
