import { Project, User } from "api/models";
import { getAllUsersInCurrentProject, updateProject } from "backend";
import { setProjectId } from "backend/localStorage";
import {
  ProjectAction,
  ProjectActionType,
} from "components/Project/ProjectReduxTypes";
import { StoreStateDispatch } from "types/Redux/actions";

export function setCurrentProject(payload?: Project): ProjectAction {
  return {
    type: ProjectActionType.SET_CURRENT_PROJECT,
    payload,
  };
}

function setCurrentProjectUsers(payload?: User[]): ProjectAction {
  return {
    type: ProjectActionType.SET_CURRENT_PROJECT_USERS,
    payload,
  };
}

export function clearCurrentProject() {
  return (dispatch: StoreStateDispatch) => {
    setProjectId();
    dispatch(setCurrentProject());
    dispatch(setCurrentProjectUsers());
  };
}

export async function saveChangesToProject(
  project: Project,
  dispatch: StoreStateDispatch
) {
  dispatch(setCurrentProject(project));
  await updateProject(project);
}

export function asyncRefreshCurrentProjectUsers() {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(setCurrentProjectUsers(await getAllUsersInCurrentProject()));
  };
}

export function asyncSetNewCurrentProject(project?: Project) {
  return async (dispatch: StoreStateDispatch) => {
    setProjectId(project?.id);
    dispatch(setCurrentProject(project));
    dispatch(asyncRefreshCurrentProjectUsers());
  };
}
