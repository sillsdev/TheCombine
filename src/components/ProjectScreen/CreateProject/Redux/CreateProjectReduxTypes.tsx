import { Project, WritingSystem } from "types/project";

export enum CreateProjectActions {
  CREATE_PROJECT_FAILURE = "CREATE_PROJECT_FAILURE",
  CREATE_PROJECT_IN_PROGRESS = "CREATE_PROJECT_IN_PROGRESS",
  CREATE_PROJECT_RESET = "CREATE_PROJECT_RESET",
  CREATE_PROJECT_SUCCESS = "CREATE_PROJECT_SUCCESS",
}

type CreateProjectType =
  | typeof CreateProjectActions.CREATE_PROJECT_FAILURE
  | typeof CreateProjectActions.CREATE_PROJECT_IN_PROGRESS
  | typeof CreateProjectActions.CREATE_PROJECT_RESET
  | typeof CreateProjectActions.CREATE_PROJECT_SUCCESS;

export interface CreateProjectAction {
  type: CreateProjectType;
  payload: CreateProjectData;
}

export interface CreateProjectData {
  name: string;
  vernacularLanguage: WritingSystem;
  analysisLanguages: WritingSystem[];
  languageData?: File;
  errorMsg?: string;
}

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
