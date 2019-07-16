import { Dispatch } from "react";
import * as backend from "../../../backend";
import { Project, defaultProject } from "../../../types/project";
import { setCurrentProject, ProjectAction } from "../../Project/ProjectActions";
import history from "../../../history";

export const IN_PROGRESS = "CREATE_PROJECT_IN_PROGRESS";
export type IN_PROGRESS = typeof IN_PROGRESS;

export const SUCCESS = "CREATE_PROJECT_SUCCESS";
export type SUCCESS = typeof SUCCESS;

export const FAILURE = "CREATE_PROJECT_FAILURE";
export type FAILURE = typeof FAILURE;

export const RESET = "CREATE_PROJECT_RESET";
export type RESET = typeof RESET;

export interface CreateProjectData {
  name: string;
  languageData?: File;
  errorMsg?: string;
}
type CreateProjectType = IN_PROGRESS | SUCCESS | FAILURE | RESET;

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
    backend
      .createProject(project)
      .then(createdProject => {
        dispatch(setCurrentProject(createdProject));

        // Upload words
        if (languageData) {
          backend
            .uploadLift(createdProject, languageData)
            .then(res => {
              backend.getProject(createdProject.id).then(res=>{
                dispatch(setCurrentProject(res));
                dispatch(success(name));
                // we manually pause so they have a chance to see the success message
                setTimeout(() => {
                  history.push("/goals");
                }, 1000);
              
              }).catch(err => {
                dispatch(failure(name, err.response.statusText));
            })
            .catch(err => {
              dispatch(failure(name, err.response.statusText));
            });
          })
        } else {
          dispatch(success(name));
          setTimeout(() => {
            history.push("/goals");
          }, 1000);
        }
      })
      .catch(err => {
        dispatch(failure(name, err.response.statusText));
      });
  };
}

export function inProgress(name: string): CreateProjectAction {
  return {
    type: IN_PROGRESS,
    payload: { name }
  };
}

export function success(name: string): CreateProjectAction {
  return {
    type: SUCCESS,
    payload: { name }
  };
}

export function failure(
  name: string,
  errorMsg: string = ""
): CreateProjectAction {
  return {
    type: FAILURE,
    payload: { name, errorMsg }
  };
}

export function reset(): CreateProjectAction {
  return { type: RESET, payload: { name: "" } };
}
