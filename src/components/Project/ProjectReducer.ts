import { Project } from "api/models";
import {
  ProjectAction,
  SET_CURRENT_PROJECT,
} from "components/Project/ProjectReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";
import { newProject } from "types/project";

export const projectReducer = (
  state = newProject(),
  action: ProjectAction | StoreAction
): Project => {
  switch (action.type) {
    case SET_CURRENT_PROJECT:
      return action.payload ?? newProject();
    case StoreActionTypes.RESET:
      return newProject();
    default:
      return state;
  }
};
