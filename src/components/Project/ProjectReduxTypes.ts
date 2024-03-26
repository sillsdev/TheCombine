import { type Project, type Speaker, type User } from "api/models";
import { type Hash } from "types/hash";
import { newProject } from "types/project";

export interface CurrentProjectState {
  project: Project;
  semanticDomains?: Hash<string>;
  speaker?: Speaker;
  users: User[];
}

export const defaultState: CurrentProjectState = {
  project: newProject(),
  users: [],
};
