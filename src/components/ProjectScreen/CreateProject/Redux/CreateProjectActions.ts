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
  recordingConsented: boolean,
  languageData?: File
) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(inProgress());
    // Create project
    const project = newProject(name);
    project.vernacularWritingSystem = vernacularLanguage;
    project.analysisWritingSystems = analysisLanguages;
    project.recordingConsented = recordingConsented;

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
              dispatch(success());
              // Manually pause so they have a chance to see the success message.
              setTimeout(() => {
                dispatch(asyncCreateUserEdits());
                history.push(Path.ProjSettings);
              }, 1000);
            })
            .catch((err) => dispatch(failure(err.response?.statusText)));
        } else {
          dispatch(success());
          setTimeout(() => {
            dispatch(asyncCreateUserEdits());
            history.push(Path.ProjSettings);
          }, 1000);
        }
      })
      .catch((err) => dispatch(failure(err.response?.statusText)));
  };
}

export function inProgress(): CreateProjectAction {
  return {
    type: CreateProjectActionTypes.CREATE_PROJECT_IN_PROGRESS,
    payload: {},
  };
}

export function success(): CreateProjectAction {
  return {
    type: CreateProjectActionTypes.CREATE_PROJECT_SUCCESS,
    payload: {},
  };
}

export function failure(errorMsg = ""): CreateProjectAction {
  return {
    type: CreateProjectActionTypes.CREATE_PROJECT_FAILURE,
    payload: { errorMsg },
  };
}

export function reset(): CreateProjectAction {
  return {
    type: CreateProjectActionTypes.CREATE_PROJECT_RESET,
    payload: {},
  };
}
