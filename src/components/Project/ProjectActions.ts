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
import i18n from "i18n";
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

/** If the project's sem dom language is set to (Default to user interface language) and
 * the UI language changes, the user must leave the project and re-enter for that change
 * to take effect on the semantic domains (a page refresh is not sufficient). */
export function asyncLoadSemanticDomains(lang?: string) {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const langParts = (lang || i18n.language).split("-");
    const langRoot = langParts.length ? langParts[0] : "";
    const { project, semanticDomains } = getState().currentProjectState;
    if (!semanticDomains || project.semDomWritingSystem.bcp47 !== langRoot) {
      dispatch(setCurrentSemDoms(await getAllSemanticDomainNames(langRoot)));
    }
  };
}

export function asyncRefreshProjectUsers(projectId: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(setCurrentUsers(await getAllProjectUsers(projectId)));
  };
}

export function asyncSetNewCurrentProject(proj?: Project) {
  return async (dispatch: StoreStateDispatch) => {
    // Update semantic domains before setting the project.
    await dispatch(asyncLoadSemanticDomains(proj?.semDomWritingSystem.bcp47));

    setProjectId(proj?.id);
    dispatch(setCurrentProject(proj));
  };
}

export function asyncUpdateCurrentProject(proj: Project) {
  return async (dispatch: StoreStateDispatch) => {
    // Update semantic domains before setting the project.
    await dispatch(asyncLoadSemanticDomains(proj.semDomWritingSystem.bcp47));

    await updateProject(proj);
    dispatch(setCurrentProject(proj));
  };
}

export function clearCurrentProject() {
  return (dispatch: StoreStateDispatch) => {
    setProjectId();
    dispatch(resetCurrentProject());
  };
}
