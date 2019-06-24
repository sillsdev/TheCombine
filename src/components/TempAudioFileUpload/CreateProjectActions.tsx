import { Dispatch } from "react";
import { history } from "../App/component";
import * as backend from "../../backend";
import { Project, defaultProject } from "../../types/project";
import { setCurrentProject, ProjectAction } from "../Project/ProjectActions";

export const CREATE_PROJECT = "CREATE_PROJECT";
export type CREATE_PROJECT = typeof CREATE_PROJECT;

export interface CreateProjectData {
  name: string;
  languageData?: File;
}
type CreateProjectType = CREATE_PROJECT;

//action types

export interface CreateProjectAction {
  type: CreateProjectType;
  payload: CreateProjectData;
  project?: Project;
}

//thunk action creator
export function asyncCreateProject(
  name: string = "james",
  languageData?: File
) {
  return async (dispatch: Dispatch<CreateProjectAction | ProjectAction>) => {
    // Create project
    let createdProject: Project = { ...defaultProject };
    createdProject.name = name;

    // Upload words
    if (languageData) {
      backend
        .uploadMp3(createdProject, languageData)
        .then(res => {
          dispatch(createProject(name, languageData));
          history.push("/nav");
        })
        .catch(err => {
          alert("Failed to upload");
          //console.log(err);
        });
    }
  };
}

//pure action creator. LEAVE PURE!
export function createProject(
  name: string,
  languageData?: File
): CreateProjectAction {
  return {
    type: CREATE_PROJECT,
    payload: { name, languageData }
  };
}
