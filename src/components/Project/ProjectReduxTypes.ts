import { Project, Speaker, User } from "api/models";
import { newProject } from "types/project";

export interface CurrentProjectState {
  project: Project;
  speaker?: Speaker;
  users: User[];
}

export const defaultState: CurrentProjectState = {
  project: newProject(),
  users: [],
};
