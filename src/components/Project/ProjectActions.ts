import { Action, PayloadAction } from "@reduxjs/toolkit";

import { Project, Speaker, User } from "api/models";
import { getAllProjectUsers, updateProject } from "backend";
import { setProjectId } from "backend/localStorage";
import {
  resetAction,
  setProjectAction,
  setSpeakerAction,
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

export function setCurrentSpeaker(speaker?: Speaker): PayloadAction {
  return setSpeakerAction(speaker);
}

export function setCurrentUsers(users?: User[]): PayloadAction {
  return setUsersAction(users ?? []);
}

// Dispatch Functions

export function asyncRefreshProjectUsers(projectId: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(setCurrentUsers(await getAllProjectUsers(projectId)));
  };
}

export function asyncUpdateCurrentProject(project: Project) {
  return async (dispatch: StoreStateDispatch) => {
    await updateProject(project);
    dispatch(setCurrentProject(project));
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
