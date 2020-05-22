import { ProjectAction, SET_CURRENT_PROJECT } from "./ProjectActions";
import { Project, defaultProject } from "../../types/project";
import { setProjectID } from "../../backend/localStorage";
import { StoreActions, StoreAction } from "../../rootActions";

export const projectReducer = (
  state: Project = { ...defaultProject },
  action: StoreAction | ProjectAction
): Project => {
  switch (action.type) {
    case SET_CURRENT_PROJECT:
      setProjectID(action.payload.id);
      return action.payload;
    case StoreActions.RESET:
      return { ...defaultProject };
    default:
      return state;
  }
};
