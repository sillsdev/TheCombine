import { updateProject } from "backend";
import { setProjectId } from "backend/localStorage";
import {
  ProjectAction,
  SET_CURRENT_PROJECT,
} from "components/Project/ProjectReduxTypes";
import { Project } from "types/project";
import { StoreStateDispatch } from "types/Redux/actions";

export function setCurrentProject(payload: Project): ProjectAction {
  setProjectId(payload.id);
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
