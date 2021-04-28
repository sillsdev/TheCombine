import {
  ProjectAction,
  SET_CURRENT_PROJECT,
} from "components/Project/ProjectReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";
import { defaultProject, Project } from "types/project";

export const projectReducer = (
  state: Project = { ...defaultProject },
  action: ProjectAction | StoreAction
): Project => {
  switch (action.type) {
    case SET_CURRENT_PROJECT:
      return action.payload;
    case StoreActionTypes.RESET:
      return { ...defaultProject };
    default:
      return state;
  }
};
