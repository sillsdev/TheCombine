import { type Action, type PayloadAction } from "@reduxjs/toolkit";
import {
  type MRT_ColumnOrderState,
  type MRT_Updater,
  type MRT_VisibilityState,
} from "material-react-table";

import { type Project, type Speaker, type User } from "api/models";
import {
  getAllProjectUsers,
  getAllSemanticDomainNames,
  updateProject,
} from "backend";
import { setProjectId } from "backend/localStorage";
import {
  resetAction,
  setColumnOrderAction,
  setColumnVisibilityAction,
  setProjectAction,
  setSemanticDomainsAction,
  setSpeakerAction,
  setUsersAction,
} from "components/Project/ProjectReducer";
import i18n from "i18n";
import { type StoreState, type StoreStateDispatch } from "rootRedux/types";
import { type Hash } from "types/hash";
import { newProject } from "types/project";

// Action Creation Functions

export function resetCurrentProject(): Action {
  return resetAction();
}

export function setReviewEntriesColumnOrder(
  updater: MRT_Updater<MRT_ColumnOrderState>
): PayloadAction {
  return setColumnOrderAction(updater);
}

export function setReviewEntriesColumnVisibility(
  updater: MRT_Updater<MRT_VisibilityState>
): PayloadAction {
  return setColumnVisibilityAction(updater);
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

export function asyncLoadSemanticDomains() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const projLang =
      getState().currentProjectState.project.semDomWritingSystem.bcp47;
    const lang = (projLang || i18n.language).split("-")[0];
    dispatch(setCurrentSemDoms(await getAllSemanticDomainNames(lang)));
  };
}

export function asyncRefreshProjectUsers(projectId: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(setCurrentUsers(await getAllProjectUsers(projectId)));
  };
}

export function asyncSetNewCurrentProject(proj?: Project) {
  return async (dispatch: StoreStateDispatch) => {
    setProjectId(proj?.id);
    dispatch(setCurrentProject(proj));
    await dispatch(asyncLoadSemanticDomains());
  };
}

export function asyncUpdateCurrentProject(proj: Project) {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const prevLang =
      getState().currentProjectState.project.semDomWritingSystem.bcp47;
    await updateProject(proj);
    dispatch(setCurrentProject(proj));
    if (prevLang !== proj.semDomWritingSystem.bcp47) {
      await dispatch(asyncLoadSemanticDomains());
    }
  };
}

export function clearCurrentProject() {
  return (dispatch: StoreStateDispatch) => {
    setProjectId();
    dispatch(resetCurrentProject());
  };
}
