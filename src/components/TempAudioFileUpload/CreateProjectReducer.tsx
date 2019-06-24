import { CREATE_PROJECT, CreateProjectAction } from "./CreateProjectActions";
import { Project } from "../../types/project";

export interface CreateProjectState {
  name: string;
  success: boolean;
  project?: Project;
}

export const defaultState: CreateProjectState = {
  name: "",
  success: false
};

export const createProjectReducer = (
  state: CreateProjectState | undefined, //createStore() calls each reducer with undefined state
  action: CreateProjectAction
): CreateProjectState => {
  if (!state) return defaultState;
  switch (action.type) {
    case CREATE_PROJECT:
      return { name: action.payload.name, success: true };
    default:
      return state;
  }
};
