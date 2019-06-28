import { Dispatch } from "react";
import * as backend from "../../backend";
import { Project, defaultProject } from "../../types/project";
import { setCurrentProject, ProjectAction } from "../Project/ProjectActions";
import history from "../../history";

export const IN_PROGRESS = "IN_PROGRESS";
export type IN_PROGRESS = typeof IN_PROGRESS;

export const SUCCESS = "SUCCESS";
export type SUCCESS = typeof SUCCESS;

export const FAILURE = "FAILURE";
export type FAILURE = typeof FAILURE;

export interface CreateProjectData {
  name: string;
  languageData?: File;
  errorMsg?: string;
}
type CreateProjectType = IN_PROGRESS | SUCCESS | FAILURE;

//action types

export interface CreateProjectAction {
  type: CreateProjectType;
  payload: CreateProjectData;
}

//thunk action creator
export function asyncCreateProject(name: string, languageData?: File) {
  return async (dispatch: Dispatch<CreateProjectAction | ProjectAction>) => {
    dispatch(inProgress(name));

    // Create project
    let project: Project = { ...defaultProject };
    project.name = name;
    let createdProject = await backend.createProject(project);
    dispatch(setCurrentProject(createdProject));

    // Upload words
    if (languageData) {
      backend
        .uploadLift(createdProject, languageData)
        .then(res => {
          setTimeout(() => {
            // we manually pause so they have a chance to see the success message
            dispatch(success(name, languageData));
            setTimeout(() => {
              history.push("/goals");
            }, 1000);
          }, 500);
        })
        .catch(err => {
          dispatch(failure(name, languageData));
          alert("Failed to create project");
        });
    } else {
      setTimeout(() => {
        dispatch(success(name));
        setTimeout(() => {
          history.push("/goals");
        }, 1000);
      }, 500);
    }
  };
}
export function inProgress(
  name: string,
  languageData?: File
): CreateProjectAction {
  return {
    type: IN_PROGRESS,
    payload: { name, languageData }
  };
}

export function success(
  name: string,
  languageData?: File
): CreateProjectAction {
  return {
    type: SUCCESS,
    payload: { name, languageData }
  };
}

export function failure(
  name: string,
  languageData?: File,
  errorMsg: string = ""
): CreateProjectAction {
  return {
    type: FAILURE,
    payload: { name, languageData, errorMsg }
  };
}
