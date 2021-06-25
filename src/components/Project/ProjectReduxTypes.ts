import { Project } from "api/models";

export const SET_CURRENT_PROJECT = "SET_CURRENT_PROJECT";

export type ProjectActionType = typeof SET_CURRENT_PROJECT;

export interface ProjectAction {
  type: ProjectActionType;
  payload?: Project;
}
