import * as backend from "backend";
import history, { Path } from "browserHistory";
import { StoreStateDispatch } from "types/actions";
import { defaultProject, Project, WritingSystem } from "types/project";
import { asyncCreateUserEdits } from "components/GoalTimeline/GoalsActions";
import { setCurrentProject } from "components/Project/ProjectActions";

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
  vernacularLanguage: WritingSystem;
  analysisLanguages: WritingSystem[];
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
export function asyncCreateProject(
  name: string,
  vernacularLanguage: WritingSystem,
  analysisLanguages: WritingSystem[],
  languageData?: File
) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(inProgress(name, vernacularLanguage, analysisLanguages));
    // Create project
    let project: Project = { ...defaultProject };
    project.name = name;
    project.vernacularWritingSystem = vernacularLanguage;
    project.analysisWritingSystems = analysisLanguages;

    backend
      .createProject(project)
      .then((createdProject) => {
        dispatch(setCurrentProject(createdProject));

        // Upload words
        if (languageData) {
          backend.uploadLift(createdProject, languageData).then((res) => {
            backend
              .getProject(createdProject.id)
              .then((res) => {
                dispatch(setCurrentProject(res));
                dispatch(success(name, vernacularLanguage, analysisLanguages));
                // we manually pause so they have a chance to see the success message
                setTimeout(() => {
                  dispatch(asyncCreateUserEdits());
                  history.push(Path.ProjSettings);
                }, 1000);
              })
              .catch((err) => {
                dispatch(
                  failure(
                    name,
                    vernacularLanguage,
                    analysisLanguages,
                    err.response.statusText
                  )
                );
              });
          });
        } else {
          dispatch(success(name, vernacularLanguage, analysisLanguages));
          setTimeout(() => {
            dispatch(asyncCreateUserEdits());
            history.push(Path.ProjSettings);
          }, 1000);
        }
      })
      .catch((err) => {
        let errorMessage: string;
        if (err.response === undefined) {
          errorMessage = err.response;
        } else {
          errorMessage = err.response.statusText;
        }
        dispatch(
          failure(name, vernacularLanguage, analysisLanguages, errorMessage)
        );
      });
  };
}

export function inProgress(
  name: string,
  vernacularLanguage: WritingSystem,
  analysisLanguages: WritingSystem[]
): CreateProjectAction {
  return {
    type: IN_PROGRESS,
    payload: { name, vernacularLanguage, analysisLanguages },
  };
}

export function success(
  name: string,
  vernacularLanguage: WritingSystem,
  analysisLanguages: WritingSystem[]
): CreateProjectAction {
  return {
    type: SUCCESS,
    payload: { name, vernacularLanguage, analysisLanguages },
  };
}

export function failure(
  name: string,
  vernacularLanguage: WritingSystem,
  analysisLanguages: WritingSystem[],
  errorMsg: string = ""
): CreateProjectAction {
  return {
    type: FAILURE,
    payload: { name, errorMsg, vernacularLanguage, analysisLanguages },
  };
}

export function reset(): CreateProjectAction {
  return {
    type: RESET,
    payload: {
      name: "",
      vernacularLanguage: { name: "", bcp47: "", font: "" },
      analysisLanguages: [{ name: "", bcp47: "", font: "" }],
    },
  };
}
