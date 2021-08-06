import { Project, User } from "api/models";
import { newProject } from "types/project";

export enum ProjectActionType {
  SET_CURRENT_PROJECT = "SET_CURRENT_PROJECT",
  SET_CURRENT_PROJECT_USERS = "SET_CURRENT_PROJECT_USERS",
}

export interface SetCurrentProjectAction {
  type: ProjectActionType.SET_CURRENT_PROJECT;
  payload?: Project;
}

export interface SetCurrentProjectUsersAction {
  type: ProjectActionType.SET_CURRENT_PROJECT_USERS;
  payload?: User[];
}

export type ProjectAction =
  | SetCurrentProjectAction
  | SetCurrentProjectUsersAction;

export interface CurrentProjectState {
  project: Project;
  users: User[];
}

export const defaultState: CurrentProjectState = {
  project: newProject(),
  users: [],
};
