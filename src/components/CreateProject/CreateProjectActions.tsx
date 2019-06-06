import { Dispatch } from "react";

export const CREATE_PROJECT = "CREATE_PROJECT";
export type CREATE_PROJECT = typeof CREATE_PROJECT;

export interface CreateProjectData {
  name: string;
  languageData: string; // TODO: correct to type of file
}
type CreateProjectType = CREATE_PROJECT;

//action types

export interface CreateProjectAction {
  type: CreateProjectType;
  payload: CreateProjectData;
}

//thunk action creator
export function asyncCreateProject(name: string, languageData: string) {
  return async (dispatch: Dispatch<CreateProjectAction>) => {
    dispatch(createProject(name, languageData));
  };
}

//pure action creator. LEAVE PURE!
export function createProject(
  name: string,
  languageData: string
): CreateProjectAction {
  return {
    type: CREATE_PROJECT,
    payload: { name, languageData }
  };
}
