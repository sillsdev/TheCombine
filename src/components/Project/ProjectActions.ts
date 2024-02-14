import { type Action, type PayloadAction } from "@reduxjs/toolkit";

import { type Project, type Speaker, type User } from "api/models";
import {
  getAllProjectUsers,
  getAllSemanticDomainNames,
  updateProject,
} from "backend";
import { setProjectId } from "backend/localStorage";
import {
  resetAction,
  setProjectAction,
  setSemanticDomainsAction,
  setSpeakerAction,
  setUsersAction,
} from "components/Project/ProjectReducer";
import { type StoreState } from "types";
import { type StoreStateDispatch } from "types/Redux/actions";
import { type Hash } from "types/hash";
import { newProject } from "types/project";

// Action Creation Functions

export function resetCurrentProject(): Action {
  return resetAction();
}

export function setCurrentProject(project?: Project): PayloadAction {
  return setProjectAction(project ?? newProject());
}

export function setCurrentSemDoms(semDoms?: Hash<string>): PayloadAction {
  return setSemanticDomainsAction(semDoms);
}

export function setCurrentSpeaker(speaker?: Speaker): PayloadAction {
  return setSpeakerAction(speaker);
}

export function setCurrentUsers(users?: User[]): PayloadAction {
  return setUsersAction(users ?? []);
}

// Dispatch Functions

export function asyncLoadSemanticDomains(lang?: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(setCurrentSemDoms(await getAllSemanticDomainNames(lang)));
  };
}

export function asyncRefreshProjectUsers(projectId: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(setCurrentUsers(await getAllProjectUsers(projectId)));
  };
}

export function asyncUpdateCurrentProject(project: Project) {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    await updateProject(project);
    dispatch(setCurrentProject(project));
    const oldLang =
      getState().currentProjectState.project.semDomWritingSystem.bcp47;
    const newLang = project.semDomWritingSystem.bcp47;
    if (oldLang !== newLang) {
      await dispatch(asyncLoadSemanticDomains(newLang));
    }
  };
}

export function clearCurrentProject() {
  return (dispatch: StoreStateDispatch) => {
    setProjectId();
    dispatch(resetCurrentProject());
  };
}

export function setNewCurrentProject(project?: Project) {
  return (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    setProjectId(project?.id);
    dispatch(setCurrentProject(project));
    const oldLang =
      getState().currentProjectState.project.semDomWritingSystem.bcp47;
    const newLang = project?.semDomWritingSystem.bcp47;
    if (oldLang !== newLang) {
      dispatch(asyncLoadSemanticDomains(newLang));
    }
  };
}
