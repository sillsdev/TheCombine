import { WritingSystem } from "api/models";
import * as backend from "backend";
import history, { Path } from "browserHistory";
import { asyncCreateUserEdits } from "components/GoalTimeline/Redux/GoalActions";
import {
  setCurrentProject,
  setNewCurrentProject,
} from "components/Project/ProjectActions";
import {
  CreateProjectAction,
  CreateProjectActionTypes,
} from "components/ProjectScreen/CreateProject/Redux/CreateProjectReduxTypes";
import { StoreStateDispatch } from "types/Redux/actions";
import { newProject } from "types/project";

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
    const project = newProject(name);
    project.vernacularWritingSystem = vernacularLanguage;
    project.analysisWritingSystems = analysisLanguages;

    await backend
      .createProject(project)
      .then(async (createdProject) => {
        dispatch(setNewCurrentProject(createdProject));

        // Upload words
        if (languageData) {
          await backend.uploadLift(createdProject.id, languageData);
          await backend
            .getProject(createdProject.id)
            .then((updatedProject) => {
              dispatch(setCurrentProject(updatedProject));
              dispatch(success(name, vernacularLanguage, analysisLanguages));
              // Manually pause so they have a chance to see the success message.
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
                  err.response?.statusText
                )
              );
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
        const errorMessage = err.response?.statusText;
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
    type: CreateProjectActionTypes.CREATE_PROJECT_IN_PROGRESS,
    payload: { name, vernacularLanguage, analysisLanguages },
  };
}

export function success(
  name: string,
  vernacularLanguage: WritingSystem,
  analysisLanguages: WritingSystem[]
): CreateProjectAction {
  return {
    type: CreateProjectActionTypes.CREATE_PROJECT_SUCCESS,
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
    type: CreateProjectActionTypes.CREATE_PROJECT_FAILURE,
    payload: { name, errorMsg, vernacularLanguage, analysisLanguages },
  };
}

export function reset(): CreateProjectAction {
  return {
    type: CreateProjectActionTypes.CREATE_PROJECT_RESET,
    payload: {
      name: "",
      vernacularLanguage: { name: "", bcp47: "", font: "" },
      analysisLanguages: [{ name: "", bcp47: "", font: "" }],
    },
  };
}
