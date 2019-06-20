import { ProjectAction, SET_CURRENT_PROJECT } from "./ProjectActions";
import { Project, defaultProject } from "../../types/project";

export const projectReducer = (
  state: Project = defaultProject,
  action: ProjectAction
): Project => {
  switch (action.type) {
    case SET_CURRENT_PROJECT:
      return action.project;
    default:
      return state;
  }
};
