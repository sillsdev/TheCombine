import { Project, User } from "api/models";
import { newProject } from "types/project";

export interface CurrentProjectState {
  project: Project;
  users: User[];
}

export const defaultState: CurrentProjectState = {
  project: newProject(),
  users: [],
};
