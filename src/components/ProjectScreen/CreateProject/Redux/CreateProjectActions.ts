import { WritingSystem } from "api/models";
import { createProject, finishUploadLift, getProject } from "backend";
import history, { Path } from "browserHistory";
import { asyncCreateUserEdits } from "components/GoalTimeline/Redux/GoalActions";
import { setNewCurrentProject } from "components/Project/ProjectActions";
import {
  CreateProjectAction,
  CreateProjectActionTypes,
} from "components/ProjectScreen/CreateProject/Redux/CreateProjectReduxTypes";
import { StoreStateDispatch } from "types/Redux/actions";
import { newProject } from "types/project";

/** thunk action creator for creating a project without an import. */
export function asyncCreateProject(
  name: string,
  vernacularWritingSystem: WritingSystem,
  analysisWritingSystems: WritingSystem[]
) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(inProgress());

    const project = newProject(name);
    project.vernacularWritingSystem = vernacularWritingSystem;
    project.analysisWritingSystems = analysisWritingSystems;

    await createProject(project)
      .then(async (createdProject) => {
        dispatch(setNewCurrentProject(createdProject));
        dispatch(success());

        // Manually pause so they have a chance to see the success message.
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

/** thunk action creator for creating a project with a pre-uploaded import. */
export function asyncFinishProject(
  name: string,
  vernacularWritingSystem: WritingSystem
) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(inProgress());

    const project = newProject(name);
    project.vernacularWritingSystem = vernacularWritingSystem;

    await createProject(project)
      .then(async (createdProject) => {
        await finishUploadLift(createdProject.id);
        createdProject = await getProject(createdProject.id);
        dispatch(setNewCurrentProject(createdProject));
        dispatch(success());

        // Manually pause so they have a chance to see the success message.
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
