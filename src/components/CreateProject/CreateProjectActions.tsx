import { Dispatch } from "react";
import { authHeader } from "../Login/AuthHeaders";
import { breakpoints } from "@material-ui/system";
import { history } from "../App/component";
import * as backend from "../../backend";
import { Project } from "../../types/project";

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
}

//thunk action creator
export function asyncCreateProject(name: string, languageData?: File) {
  return async (dispatch: Dispatch<CreateProjectAction>) => {
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
    await backend.createProject(project);

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
          console.log(err);
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
