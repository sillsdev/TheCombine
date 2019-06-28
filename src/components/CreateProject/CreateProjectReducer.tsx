import {
  IN_PROGRESS,
  SUCCESS,
  FAILURE,
  CreateProjectAction
} from "./CreateProjectActions";
import { Project } from "../../types/project";

export interface CreateProjectState {
  name: string;
  inProgress: boolean;
  success: boolean;
  errorMsg: string;
  project?: Project;
}

export const defaultState: CreateProjectState = {
  name: "",
  success: false,
  inProgress: false,
  errorMsg: ""
};

export const createProjectReducer = (
  state: CreateProjectState = defaultState,
  action: CreateProjectAction
): CreateProjectState => {
  switch (action.type) {
    case IN_PROGRESS:
      return {
        name: action.payload.name,
        success: false,
        inProgress: true,
        errorMsg: ""
      };
    case SUCCESS:
      return {
        name: action.payload.name,
        success: true,
        inProgress: false,
        errorMsg: ""
      };
    case FAILURE:
      return {
        name: action.payload.name,
        success: false,
        inProgress: false,
        errorMsg: action.payload.errorMsg || ""
      };
    default:
      return state;
  }
};
