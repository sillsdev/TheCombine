import { updateProject } from "backend";
import { StoreStateDispatch } from "types/actions";
import { Project } from "types/project";

export const SET_CURRENT_PROJECT = "SET_CURRENT_PROJECT";

type ProjectActionType = typeof SET_CURRENT_PROJECT;

export interface ProjectAction {
  type: ProjectActionType;
  payload: Project;
}

export function setCurrentProject(payload: Project): ProjectAction {
  return {
    type: SET_CURRENT_PROJECT,
    payload,
  };
}

export async function saveChangesToProject(
  project: Project,
  dispatch: StoreStateDispatch
) {
  dispatch(setCurrentProject(project));
  await updateProject(project);
}
