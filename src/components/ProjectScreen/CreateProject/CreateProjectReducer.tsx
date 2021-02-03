import {
  IN_PROGRESS,
  SUCCESS,
  FAILURE,
  RESET,
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
    case IN_PROGRESS:
      return {
        name: action.payload.name,
        vernacularLanguage: action.payload.vernacularLanguage,
        analysisLanguages: action.payload.analysisLanguages,
        success: false,
        inProgress: true,
        errorMsg: "",
      };
    case SUCCESS:
      return {
        name: action.payload.name,
        vernacularLanguage: action.payload.vernacularLanguage,
        analysisLanguages: action.payload.analysisLanguages,
        success: true,
        inProgress: false,
        errorMsg: "",
      };
    case FAILURE:
      return {
        name: action.payload.name,
        vernacularLanguage: action.payload.vernacularLanguage,
        analysisLanguages: action.payload.analysisLanguages,
        success: false,
        inProgress: false,
        errorMsg: action.payload.errorMsg || "",
      };
    case RESET:
      return defaultState;
    case StoreActions.RESET:
      return defaultState;
    default:
      return state;
  }
};
