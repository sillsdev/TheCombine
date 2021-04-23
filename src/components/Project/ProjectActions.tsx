import { updateProject } from "backend";
import { StoreStateDispatch } from "types/Redux/actions";
import { Project } from "types/project";
import { ProjectAction, SET_CURRENT_PROJECT } from "./ProjectReduxTypes";

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
