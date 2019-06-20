import { ProjectAction, SET_CURRENT_PROJECT } from "./ProjectActions";
import { Project } from "../../types/project";

export interface ProjectState {
  project?: Project;
}

export const projectReducer = (
  state: ProjectState | undefined, //createStore() calls each reducer with undefined state
  action: ProjectAction
): ProjectState => {
  if (!state) return {};
  switch (action.type) {
    case SET_CURRENT_PROJECT:
      return { ...state, project: action.project };
    default:
      return state;
  }
};
