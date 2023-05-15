import {
  CreateProjectAction,
  CreateProjectActionTypes,
  CreateProjectState,
  defaultState,
} from "components/ProjectScreen/CreateProject/Redux/CreateProjectReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";

export const createProjectReducer = (
  state: CreateProjectState = defaultState,
  action: CreateProjectAction | StoreAction
): CreateProjectState => {
  switch (action.type) {
    case CreateProjectActionTypes.CREATE_PROJECT_IN_PROGRESS:
      return {
        success: false,
        inProgress: true,
        errorMsg: "",
      };
    case CreateProjectActionTypes.CREATE_PROJECT_SUCCESS:
      return {
        success: true,
        inProgress: false,
        errorMsg: "",
      };
    case CreateProjectActionTypes.CREATE_PROJECT_FAILURE:
      return {
        success: false,
        inProgress: false,
        errorMsg: action.payload.errorMsg ?? "",
      };
    case CreateProjectActionTypes.CREATE_PROJECT_RESET:
      return defaultState;
    case StoreActionTypes.RESET:
      return defaultState;
    default:
      return state;
  }
};
