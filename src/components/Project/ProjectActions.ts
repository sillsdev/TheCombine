import { Project, User } from "api/models";
import { getAllProjectUsers, updateProject } from "backend";
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

export function setCurrentProjectUsers(payload?: User[]): ProjectAction {
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

export function asyncUpdateCurrentProject(project: Project) {
  return async (dispatch: StoreStateDispatch) => {
    await updateProject(project);
    dispatch(setCurrentProject(project));
  };
}

export function asyncRefreshProjectUsers(projectId: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(setCurrentProjectUsers(await getAllProjectUsers(projectId)));
  };
}

export function setNewCurrentProject(project?: Project) {
  return (dispatch: StoreStateDispatch) => {
    setProjectId(project?.id);
    dispatch(setCurrentProject(project));
  };
}
