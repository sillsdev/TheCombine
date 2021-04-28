import { updateProject } from "backend";
import {
  ProjectAction,
  SET_CURRENT_PROJECT,
} from "components/Project/ProjectReduxTypes";
import { Project } from "types/project";
import { StoreStateDispatch } from "types/Redux/actions";

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
