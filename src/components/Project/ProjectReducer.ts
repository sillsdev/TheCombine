import {
  CurrentProjectState,
  defaultState,
  ProjectAction,
  ProjectActionType,
} from "components/Project/ProjectReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";
import { newProject } from "types/project";

export const projectReducer = (
  state = defaultState,
  action: ProjectAction | StoreAction
): CurrentProjectState => {
  switch (action.type) {
    case ProjectActionType.SET_CURRENT_PROJECT:
      if (action.payload?.id === state.project.id) {
        return { ...state, project: action.payload };
      }
      return { project: action.payload ?? newProject(), users: [] };
    case ProjectActionType.SET_CURRENT_PROJECT_USERS:
      return { ...state, users: action.payload ?? [] };
    case StoreActionTypes.RESET:
      return defaultState;
    default:
      return state;
  }
};
