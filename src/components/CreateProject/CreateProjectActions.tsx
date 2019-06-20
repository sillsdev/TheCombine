import { Dispatch } from "react";
import { history } from "../App/component";
import * as backend from "../../backend";
import { Project } from "../../types/project";
import { setCurrentProject, ProjectAction } from "../Project/ProjectActions";

export const CREATE_PROJECT = "CREATE_PROJECT";
export type CREATE_PROJECT = typeof CREATE_PROJECT;

export const SET_CURRENT_PROJECT = "SET_CURRENT_PROJECT";
export type SET_CURRENT_PROJECT = typeof SET_CURRENT_PROJECT;

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
export function asyncCreateProject(name: string, languageData?: File) {
  return async (dispatch: Dispatch<CreateProjectAction | ProjectAction>) => {
    // Create project
    let project: Project = {
      id: "",
      name: name,
      semanticDomains: [],
      userRoles: "",
      vernacularWritingSystem: "",
      analysisWritingSystems: [],
      characterSet: [],
      customFields: [],
      wordFields: [],
      partsOfSpeech: [],
      words: []
    };
    project = await backend.createProject(project);
    dispatch(setCurrentProject(project));

    // Upload words
    if (languageData) {
      backend
        .uploadLift(project, languageData)
        .then(res => {
          dispatch(createProject(name, languageData));
          history.push("/nav");
        })
        .catch(err => {
          alert("Failed to create project");
          //console.log(err);
        });
    } else {
      dispatch(createProject(name));
      history.push("/nav");
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
