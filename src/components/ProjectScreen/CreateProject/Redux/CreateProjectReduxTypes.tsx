import { Project, WritingSystem } from "api/models";
import { newWritingSystem } from "types/project";

export enum CreateProjectActionTypes {
  CREATE_PROJECT_FAILURE = "CREATE_PROJECT_FAILURE",
  CREATE_PROJECT_IN_PROGRESS = "CREATE_PROJECT_IN_PROGRESS",
  CREATE_PROJECT_RESET = "CREATE_PROJECT_RESET",
  CREATE_PROJECT_SUCCESS = "CREATE_PROJECT_SUCCESS",
}

type CreateProjectType =
  | typeof CreateProjectActionTypes.CREATE_PROJECT_FAILURE
  | typeof CreateProjectActionTypes.CREATE_PROJECT_IN_PROGRESS
  | typeof CreateProjectActionTypes.CREATE_PROJECT_RESET
  | typeof CreateProjectActionTypes.CREATE_PROJECT_SUCCESS;

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
  vernacularLanguage: newWritingSystem(),
  analysisLanguages: [newWritingSystem()],
  success: false,
  inProgress: false,
  errorMsg: "",
};
