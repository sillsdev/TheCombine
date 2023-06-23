import { WritingSystem } from "api/models";
import * as backend from "backend";
import history, { Path } from "browserHistory";
import { asyncCreateUserEdits } from "components/GoalTimeline/Redux/GoalActions";
import { setNewCurrentProject } from "components/Project/ProjectActions";
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
  analysisLanguages: WritingSystem[]
) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(inProgress());

    const project = newProject(name);
    project.vernacularWritingSystem = vernacularLanguage;
    project.analysisWritingSystems = analysisLanguages;

    await backend
      .createProject(project)
      .then(async (createdProject) => {
        dispatch(setNewCurrentProject(createdProject));

        // Upload words
        dispatch(success());
        setTimeout(() => {
          dispatch(asyncCreateUserEdits());
          history.push(Path.ProjSettings);
        }, 1000);
      })
      .catch((e) => {
        dispatch(failure(e.response?.statusText));
      });
  };
}

//thunk action creator
export function asyncFinishProject(
  name: string,
  vernacularLanguage: WritingSystem
) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(inProgress());

    const project = newProject(name);
    project.vernacularWritingSystem = vernacularLanguage;

    await backend
      .createProject(project)
      .then(async (createdProject) => {
        await backend.finishUploadLift(createdProject.id);
        createdProject = await backend.getProject(createdProject.id);
        dispatch(setNewCurrentProject(createdProject));
        dispatch(success());
        setTimeout(() => {
          dispatch(asyncCreateUserEdits());
          history.push(Path.ProjSettings);
        }, 1000);
      })
      .catch((e) => {
        dispatch(failure(e.response?.statusText));
      });
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
