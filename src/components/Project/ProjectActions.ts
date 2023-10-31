import { Action, PayloadAction } from "@reduxjs/toolkit";

import { Project, User } from "api/models";
import { getAllProjectUsers, updateProject } from "backend";
import { setProjectId } from "backend/localStorage";
import {
  resetAction,
  setProjectAction,
  setUsersAction,
} from "components/Project/ProjectReducer";
import { StoreStateDispatch } from "types/Redux/actions";
import { newProject } from "types/project";

// Action Creation Functions

export function resetCurrentProject(): Action {
  return resetAction();
}

export function setCurrentProject(project?: Project): PayloadAction {
  return setProjectAction(project ?? newProject());
}

export function setCurrentProjectUsers(users?: User[]): PayloadAction {
  return setUsersAction(users ?? []);
}

// Dispatch Functions

export function asyncUpdateCurrentProject(project: Project) {
  return async (dispatch: StoreStateDispatch) => {
    await updateProject(project);
    dispatch(setCurrentProject(project));
  };
}

/** Should only be called with projectId matching that in currentProjectState. */
export function asyncRefreshProjectUsers(projectId: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(setCurrentProjectUsers(await getAllProjectUsers(projectId)));
  };
}

export function clearCurrentProject() {
  return (dispatch: StoreStateDispatch) => {
    setProjectId();
    dispatch(resetCurrentProject());
  };
}

export function setNewCurrentProject(project?: Project) {
  return (dispatch: StoreStateDispatch) => {
    setProjectId(project?.id);
    dispatch(setCurrentProject(project));
  };
}
