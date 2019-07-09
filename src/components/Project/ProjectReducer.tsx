import { ProjectAction, SET_CURRENT_PROJECT } from "./ProjectActions";
import { Project, defaultProject } from "../../types/project";
import {setProjectID} from '../../backend';

export const projectReducer = (
  state: Project = { ...defaultProject },
  action: ProjectAction
): Project => {
  switch (action.type) {
    case SET_CURRENT_PROJECT:
      setProjectID(action.payload.id);
      return action.payload;
    default:
      return state;
  }
};
