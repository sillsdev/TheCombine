import { Project } from "../../types/project";

export const SET_CURRENT_PROJECT = "SET_CURRENT_PROJECT";
export type SET_CURRENT_PROJECT = typeof SET_CURRENT_PROJECT;

type ProjectType = SET_CURRENT_PROJECT;

//action types

export interface ProjectAction {
  type: ProjectType;
  payload: Project;
}

export function setCurrentProject(payload: Project): ProjectAction {
  return {
    type: SET_CURRENT_PROJECT,
    payload
  };
}
