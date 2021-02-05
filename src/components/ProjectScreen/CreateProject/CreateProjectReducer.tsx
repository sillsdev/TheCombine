import {
  CREATE_PROJECT_IN_PROGRESS,
  CREATE_PROJECT_SUCCESS,
  CREATE_PROJECT_FAILURE,
  CREATE_PROJECT_RESET,
  CreateProjectAction,
} from "components/ProjectScreen/CreateProject/CreateProjectActions";
import { Project, WritingSystem } from "types/project";
import { StoreAction, StoreActions } from "rootActions";

export interface CreateProjectState {
  name: string;
  vernacularLanguage: WritingSystem;
  analysisLanguages: WritingSystem[];
  inProgress: boolean;
  success: boolean;
  errorMsg: string;
  project?: Project;
}

export const defaultState: CreateProjectState = {
  name: "",
  vernacularLanguage: { name: "", bcp47: "", font: "" },
  analysisLanguages: [{ name: "", bcp47: "", font: "" }],
  success: false,
  inProgress: false,
  errorMsg: "",
};

export const createProjectReducer = (
  state: CreateProjectState = defaultState,
  action: StoreAction | CreateProjectAction
): CreateProjectState => {
  switch (action.type) {
    case CREATE_PROJECT_IN_PROGRESS:
      return {
        name: action.payload.name,
        vernacularLanguage: action.payload.vernacularLanguage,
        analysisLanguages: action.payload.analysisLanguages,
        success: false,
        inProgress: true,
        errorMsg: "",
      };
    case CREATE_PROJECT_SUCCESS:
      return {
        name: action.payload.name,
        vernacularLanguage: action.payload.vernacularLanguage,
        analysisLanguages: action.payload.analysisLanguages,
        success: true,
        inProgress: false,
        errorMsg: "",
      };
    case CREATE_PROJECT_FAILURE:
      return {
        name: action.payload.name,
        vernacularLanguage: action.payload.vernacularLanguage,
        analysisLanguages: action.payload.analysisLanguages,
        success: false,
        inProgress: false,
        errorMsg: action.payload.errorMsg || "",
      };
    case CREATE_PROJECT_RESET:
      return defaultState;
    case StoreActions.RESET:
      return defaultState;
    default:
      return state;
  }
};
