import {
  CreateProjectAction,
  CreateProjectActionTypes,
  CreateProjectState,
  defaultState,
} from "components/ProjectScreen/CreateProject/Redux/CreateProjectReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";

export const createProjectReducer = (
  state: CreateProjectState = defaultState,
  action: CreateProjectAction | StoreAction,
): CreateProjectState => {
  switch (action.type) {
    case CreateProjectActionTypes.CREATE_PROJECT_IN_PROGRESS:
      return { ...defaultState, inProgress: true };
    case CreateProjectActionTypes.CREATE_PROJECT_SUCCESS:
      return { ...defaultState, success: true };
    case CreateProjectActionTypes.CREATE_PROJECT_FAILURE:
      return { ...defaultState, errorMsg: action.payload.errorMsg ?? "" };
    case CreateProjectActionTypes.CREATE_PROJECT_RESET:
      return defaultState;
    case StoreActionTypes.RESET:
      return defaultState;
    default:
      return state;
  }
};
