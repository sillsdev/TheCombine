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
  errorMsg?: string;
}

export interface CreateProjectState {
  inProgress: boolean;
  success: boolean;
  errorMsg: string;
}

export const defaultState: CreateProjectState = {
  success: false,
  inProgress: false,
  errorMsg: "",
};
