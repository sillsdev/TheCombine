import { Action, PayloadAction } from "@reduxjs/toolkit";

import { WritingSystem } from "api/models";
import { createProject, finishUploadLift, getProject } from "backend";
import router from "browserRouter";
import { asyncCreateUserEdits } from "components/GoalTimeline/Redux/GoalActions";
import { setNewCurrentProject } from "components/Project/ProjectActions";
import {
  failureAction,
  inProgressAction,
  resetAction,
  successAction,
} from "components/ProjectScreen/CreateProject/Redux/CreateProjectReducer";
import { StoreStateDispatch } from "types/Redux/actions";
import { Path } from "types/path";
import { newProject } from "types/project";

// Action Creation Functions

export function failure(errorMsg = ""): PayloadAction {
  return failureAction(errorMsg);
}

export function inProgress(): Action {
  return inProgressAction();
}

export function reset(): Action {
  return resetAction();
}

export function success(): Action {
  return successAction();
}

// Dispatch Functions

/*** Create a project without an import. */
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
          router.navigate(Path.ProjSettings);
        }, 1000);
      })
      .catch((e) => {
        dispatch(failure(e.response?.statusText));
      });
  };
}

/*** Create a project with a pre-uploaded import. */
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
          router.navigate(Path.ProjSettings);
        }, 1000);
      })
      .catch((e) => {
        dispatch(failure(e.response?.statusText));
      });
  };
}
