import { StoreAction, StoreActions } from "rootActions";
import {
  CreateProjectAction,
  CreateProjectActions,
  CreateProjectState,
  defaultState,
} from "./CreateProjectReduxTypes";

export const createProjectReducer = (
  state: CreateProjectState = defaultState,
  action: StoreAction | CreateProjectAction
): CreateProjectState => {
  switch (action.type) {
    case CreateProjectActions.CREATE_PROJECT_IN_PROGRESS:
      return {
        name: action.payload.name,
        vernacularLanguage: action.payload.vernacularLanguage,
        analysisLanguages: action.payload.analysisLanguages,
        success: false,
        inProgress: true,
        errorMsg: "",
      };
    case CreateProjectActions.CREATE_PROJECT_SUCCESS:
      return {
        name: action.payload.name,
        vernacularLanguage: action.payload.vernacularLanguage,
        analysisLanguages: action.payload.analysisLanguages,
        success: true,
        inProgress: false,
        errorMsg: "",
      };
    case CreateProjectActions.CREATE_PROJECT_FAILURE:
      return {
        name: action.payload.name,
        vernacularLanguage: action.payload.vernacularLanguage,
        analysisLanguages: action.payload.analysisLanguages,
        success: false,
        inProgress: false,
        errorMsg: action.payload.errorMsg || "",
      };
    case CreateProjectActions.CREATE_PROJECT_RESET:
      return defaultState;
    case StoreActions.RESET:
      return defaultState;
    default:
      return state;
  }
};
