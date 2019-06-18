import { Dispatch } from "react";
import axios from "axios";
import { authHeader } from "../Login/AuthHeaders";
import { breakpoints } from "@material-ui/system";
import { history } from "../App/component";

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
    let project = {
      id: "",
      name: name,
      semanticDomains: [],
      userRoles: "",
      vernacularWritingSystem: "",
      analysisWritingSystems: [],
      characterSet: [],
      customFields: [],
      wordFields: [],
      partsOfSpeech: []
    };
    await axios.post(
      "https://localhost:5001/v1/projects",
      JSON.stringify(project),
      {
        headers: { ...authHeader(), "Content-Type": "application/json" }
      }
    );

    // Upload words
    if (languageData) {
      const data = new FormData();
      data.append("file", languageData);
      data.append("name", name);
      await axios
        .post("https://localhost:5001/v1/projects/words/upload/", data, {
          headers: { ...authHeader(), "Content-Type": "multipart/form-data" }
        })
        .then(res => {
          console.log(res.statusText);
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
