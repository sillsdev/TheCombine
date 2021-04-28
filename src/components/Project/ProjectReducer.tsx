import { setProjectId } from "backend/localStorage";
import {
  ProjectAction,
  SET_CURRENT_PROJECT,
} from "components/Project/ProjectReduxTypes";
import { StoreActions, StoreAction } from "rootActions";
import { Project, defaultProject } from "types/project";

export const projectReducer = (
  state: Project = { ...defaultProject },
  action: StoreAction | ProjectAction
): Project => {
  switch (action.type) {
    case SET_CURRENT_PROJECT:
      setProjectId(action.payload.id);
      return action.payload;
    case StoreActions.RESET:
      return { ...defaultProject };
    default:
      return state;
  }
};
